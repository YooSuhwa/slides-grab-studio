#!/usr/bin/env node

import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { analyzeImage } from '../src/vlm/analyze.js';

const DEFAULT_PROVIDER = 'google';
const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_MAX_ITERATIONS = 3;
const SCREENSHOT_SIZE = { width: 1600, height: 900 };
const SLIDE_FILE_PATTERN = /^slide-.*\.html$/i;

const SLIDES_DIR = join(process.cwd(), 'slides');

function printUsage() {
  process.stdout.write(
    [
      'Usage: node scripts/vlm-validate.js [options]',
      '',
      'Options:',
      '  --max-iterations <number>  Maximum VLM retries per slide (default: 3)',
      '  --provider <name>          VLM provider (default: google)',
      '  --model <name>             VLM model (default: gemini-2.0-flash)',
      '  -h, --help                 Show this help message',
      '',
      'Examples:',
      '  node scripts/vlm-validate.js',
      '  node scripts/vlm-validate.js --max-iterations 5 --provider anthropic --model claude-3-7-sonnet',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function readOptionValue(args, index, optionName) {
  const next = args[index + 1];
  if (!next || next.startsWith('-')) {
    throw new Error(`Missing value for ${optionName}.`);
  }
  return next;
}

function parsePositiveInteger(value, optionName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${optionName} must be a positive integer.`);
  }
  return parsed;
}

export function parseCliArgs(args) {
  const options = {
    maxIterations: DEFAULT_MAX_ITERATIONS,
    provider: DEFAULT_PROVIDER,
    model: DEFAULT_MODEL,
    help: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg === '--max-iterations') {
      options.maxIterations = parsePositiveInteger(
        readOptionValue(args, i, '--max-iterations'),
        '--max-iterations',
      );
      i += 1;
      continue;
    }

    if (arg.startsWith('--max-iterations=')) {
      options.maxIterations = parsePositiveInteger(
        arg.slice('--max-iterations='.length),
        '--max-iterations',
      );
      continue;
    }

    if (arg === '--provider') {
      options.provider = readOptionValue(args, i, '--provider');
      i += 1;
      continue;
    }

    if (arg.startsWith('--provider=')) {
      options.provider = arg.slice('--provider='.length);
      continue;
    }

    if (arg === '--model') {
      options.model = readOptionValue(args, i, '--model');
      i += 1;
      continue;
    }

    if (arg.startsWith('--model=')) {
      options.model = arg.slice('--model='.length);
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (typeof options.provider !== 'string' || options.provider.trim() === '') {
    throw new Error('--provider must be a non-empty string.');
  }

  if (typeof options.model !== 'string' || options.model.trim() === '') {
    throw new Error('--model must be a non-empty string.');
  }

  options.provider = options.provider.trim().toLowerCase();
  options.model = options.model.trim();

  return options;
}

function toSlideOrder(fileName) {
  const match = fileName.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : Number.POSITIVE_INFINITY;
}

function sortSlideFiles(a, b) {
  const orderA = toSlideOrder(a);
  const orderB = toSlideOrder(b);
  if (orderA !== orderB) return orderA - orderB;
  return a.localeCompare(b);
}

async function findSlideFiles() {
  const entries = await readdir(SLIDES_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && SLIDE_FILE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort(sortSlideFiles);
}

function buildPrompt(slideFile, previousError = '') {
  const retryHint = previousError
    ? `Previous response format error: ${previousError}\nReturn strict JSON only.`
    : '';

  return [
    'You are a presentation QA reviewer.',
    `Analyze the attached slide screenshot (${SCREENSHOT_SIZE.width}x${SCREENSHOT_SIZE.height}px).`,
    'Find visual formatting issues: overflow, clipped text, element overlap, and readability/contrast problems.',
    `Slide file: ${slideFile}`,
    'Return only JSON (no markdown) in this exact shape:',
    `{"slide":"${slideFile}","status":"pass|fail","issues":[{"type":"overflow|text-clipped|overlap|readability|other","severity":"critical|warning","message":"string","evidence":"string","suggestion":"string"}]}`,
    'Rules:',
    '- If issues is empty then status must be "pass".',
    '- If issues is not empty then status must be "fail".',
    '- Keep issue messages concise and concrete.',
    retryHint,
  ]
    .filter(Boolean)
    .join('\n');
}

function extractJsonObject(content) {
  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error('VLM response is empty.');
  }

  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error('No JSON object found in VLM response.');
}

function normalizeIssue(issue, index) {
  if (!issue || typeof issue !== 'object' || Array.isArray(issue)) {
    return {
      type: 'other',
      severity: 'warning',
      message: `Issue ${index + 1}`,
      evidence: '',
      suggestion: '',
    };
  }

  const severity =
    typeof issue.severity === 'string' && issue.severity.toLowerCase() === 'critical'
      ? 'critical'
      : 'warning';

  return {
    type: typeof issue.type === 'string' && issue.type.trim() !== '' ? issue.type.trim() : 'other',
    severity,
    message:
      typeof issue.message === 'string' && issue.message.trim() !== ''
        ? issue.message.trim()
        : `Issue ${index + 1}`,
    evidence: typeof issue.evidence === 'string' ? issue.evidence.trim() : '',
    suggestion: typeof issue.suggestion === 'string' ? issue.suggestion.trim() : '',
  };
}

export function parseStructuredFeedback(content, defaultSlideFile) {
  const jsonText = extractJsonObject(content);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `Failed to parse VLM JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('VLM response JSON root must be an object.');
  }

  const issues = Array.isArray(parsed.issues)
    ? parsed.issues.map((issue, index) => normalizeIssue(issue, index))
    : [];

  let status = typeof parsed.status === 'string' ? parsed.status.trim().toLowerCase() : '';
  if (status !== 'pass' && status !== 'fail') {
    status = issues.length > 0 ? 'fail' : 'pass';
  }

  return {
    slide:
      typeof parsed.slide === 'string' && parsed.slide.trim() !== ''
        ? parsed.slide.trim()
        : defaultSlideFile,
    status,
    issues,
  };
}

function sumUsage(current, next) {
  return {
    inputTokens: current.inputTokens + (next?.inputTokens ?? 0),
    outputTokens: current.outputTokens + (next?.outputTokens ?? 0),
  };
}

async function captureSlideScreenshot(page, slideFile, screenshotPath) {
  const slidePath = join(SLIDES_DIR, slideFile);
  const slideUrl = pathToFileURL(slidePath).href;

  await page.goto(slideUrl, { waitUntil: 'load' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page.evaluate(({ width, height }) => {
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    htmlStyle.margin = '0';
    htmlStyle.padding = '0';
    htmlStyle.overflow = 'hidden';
    htmlStyle.background = '#ffffff';

    bodyStyle.margin = '0';
    bodyStyle.padding = '0';
    bodyStyle.transformOrigin = 'top left';

    const rect = document.body.getBoundingClientRect();
    const sourceWidth = rect.width > 0 ? rect.width : width;
    const sourceHeight = rect.height > 0 ? rect.height : height;
    const scale = Math.min(width / sourceWidth, height / sourceHeight);

    bodyStyle.transform = `scale(${scale})`;
  }, SCREENSHOT_SIZE);

  await page.screenshot({
    path: screenshotPath,
    fullPage: false,
  });
}

async function validateSlide(page, slideFile, screenshotDir, options) {
  const screenshotFile = `${basename(slideFile, extname(slideFile))}.png`;
  const screenshotPath = join(screenshotDir, screenshotFile);

  await captureSlideScreenshot(page, slideFile, screenshotPath);

  let previousParseError = '';
  let usage = { inputTokens: 0, outputTokens: 0 };
  let lastErrorMessage = '';

  for (let attempt = 1; attempt <= options.maxIterations; attempt += 1) {
    try {
      const prompt = buildPrompt(slideFile, previousParseError);
      const response = await analyzeImage(screenshotPath, prompt, {
        provider: options.provider,
        model: options.model,
        temperature: 0,
        maxTokens: 1200,
      });

      usage = sumUsage(usage, response.usage);
      const parsed = parseStructuredFeedback(response.content, slideFile);
      return {
        slide: parsed.slide,
        status: parsed.status,
        issues: parsed.issues,
        attempts: attempt,
        usage,
      };
    } catch (error) {
      lastErrorMessage = error instanceof Error ? error.message : String(error);
      previousParseError = lastErrorMessage;

      if (attempt === options.maxIterations) {
        return {
          slide: slideFile,
          status: 'fail',
          issues: [
            {
              type: 'validation-error',
              severity: 'critical',
              message: 'Slide validation failed within max iteration limit.',
              evidence: lastErrorMessage,
              suggestion: 'Check provider/model configuration and enforce strict JSON output.',
            },
          ],
          attempts: attempt,
          usage,
        };
      }
    }
  }

  return {
    slide: slideFile,
    status: 'fail',
    issues: [
      {
        type: 'unknown',
        severity: 'critical',
        message: 'Validation did not complete.',
        evidence: '',
        suggestion: '',
      },
    ],
    attempts: options.maxIterations,
    usage,
  };
}

function summarizeSlides(slides) {
  const summary = {
    totalSlides: slides.length,
    passedSlides: 0,
    failedSlides: 0,
    totalIssues: 0,
  };

  for (const slide of slides) {
    if (slide.status === 'pass') {
      summary.passedSlides += 1;
    } else {
      summary.failedSlides += 1;
    }
    summary.totalIssues += Array.isArray(slide.issues) ? slide.issues.length : 0;
  }

  return summary;
}

export async function runVlmValidation(args = process.argv.slice(2)) {
  const options = parseCliArgs(args);

  if (options.help) {
    printUsage();
    return {
      generatedAt: new Date().toISOString(),
      options,
      slides: [],
      summary: {
        totalSlides: 0,
        passedSlides: 0,
        failedSlides: 0,
        totalIssues: 0,
      },
    };
  }

  const slideFiles = await findSlideFiles();
  if (slideFiles.length === 0) {
    throw new Error('No slide-*.html files found in slides/');
  }

  const screenshotDir = await mkdtemp(join(os.tmpdir(), 'vlm-validate-'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: SCREENSHOT_SIZE });
  const page = await context.newPage();

  const slides = [];

  try {
    for (const slideFile of slideFiles) {
      try {
        const result = await validateSlide(page, slideFile, screenshotDir, options);
        slides.push(result);
      } catch (error) {
        slides.push({
          slide: slideFile,
          status: 'fail',
          issues: [
            {
              type: 'runtime-error',
              severity: 'critical',
              message: 'Slide validation failed before completion.',
              evidence: error instanceof Error ? error.message : String(error),
              suggestion: 'Check API key, model, and slide HTML validity.',
            },
          ],
          attempts: options.maxIterations,
          usage: {
            inputTokens: 0,
            outputTokens: 0,
          },
        });
      }
    }
  } finally {
    await browser.close();
    await rm(screenshotDir, { recursive: true, force: true });
  }

  const result = {
    generatedAt: new Date().toISOString(),
    options: {
      provider: options.provider,
      model: options.model,
      maxIterations: options.maxIterations,
      screenshot: SCREENSHOT_SIZE,
    },
    slides,
    summary: summarizeSlides(slides),
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (result.summary.failedSlides > 0) {
    process.exitCode = 1;
  }

  return result;
}

function isExecutedAsScript() {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isExecutedAsScript()) {
  runVlmValidation().catch((error) => {
    const failure = {
      generatedAt: new Date().toISOString(),
      options: {
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        maxIterations: DEFAULT_MAX_ITERATIONS,
        screenshot: SCREENSHOT_SIZE,
      },
      slides: [],
      summary: {
        totalSlides: 0,
        passedSlides: 0,
        failedSlides: 0,
        totalIssues: 1,
      },
      error: error instanceof Error ? error.message : String(error),
    };

    process.stdout.write(`${JSON.stringify(failure, null, 2)}\n`);
    process.exit(1);
  });
}
