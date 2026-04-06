import { spawn } from 'node:child_process';

import { buildCodexExecArgs } from '../../src/editor/codex-edit.js';

/**
 * Spawn a Codex subprocess for slide editing.
 */
export function spawnCodexEdit({ prompt, imagePath, model, cwd, onLog, timeout = 300_000 }) {
  const codexBin = process.env.PPT_AGENT_CODEX_BIN || 'codex';
  const args = buildCodexExecArgs({ prompt, imagePath, model });

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(codexBin, args, { cwd, stdio: 'pipe', shell: process.platform === 'win32' });

    let stdout = '';
    let stderr = '';
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* already exited */ } }, 5000);
    }, timeout);

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      onLog('stdout', text);
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      onLog('stderr', text);
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolvePromise({
        code: killed ? -1 : (code ?? 1),
        stdout,
        stderr: killed ? stderr + `\n[TIMEOUT after ${timeout}ms]` : stderr,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
  });
}

/**
 * Spawn a Claude subprocess for slide editing.
 */
export function spawnClaudeEdit({ prompt, imagePath, imagePaths, model, cwd, onLog, timeout = 600_000 }) {
  const claudeBin = process.env.PPT_AGENT_CLAUDE_BIN || 'claude';

  const args = [
    '-p',
    '--dangerously-skip-permissions',
    '--model', model.trim(),
    '--max-turns', '30',
    '--verbose',
  ];

  let fullPrompt = prompt;
  if (Array.isArray(imagePaths) && imagePaths.length > 0) {
    const lines = ['First, read the following PDF page images to understand the visual layout and content:'];
    imagePaths.forEach((p, i) => lines.push(`- Page ${i + 1}: "${p}"`));
    lines.push('', 'These images show the original document pages. Use them to understand charts, diagrams, tables, and visual layout.', '');
    fullPrompt = lines.join('\n') + prompt;
  } else if (typeof imagePath === 'string' && imagePath.trim() !== '') {
    fullPrompt = `First, read the annotated screenshot at "${imagePath.trim()}" to see the visual context of the bbox regions highlighted on the slide.\n\n${prompt}`;
  }

  const env = { ...process.env };
  delete env.CLAUDECODE;

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(claudeBin, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
      shell: process.platform === 'win32',
    });

    child.stdin.write(fullPrompt);
    child.stdin.end();

    let stdout = '';
    let stderr = '';
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* already exited */ } }, 5000);
    }, timeout);

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      onLog('stdout', text);
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      onLog('stderr', text);
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolvePromise({
        code: killed ? -1 : (code ?? 1),
        stdout,
        stderr: killed ? stderr + `\n[TIMEOUT after ${timeout}ms]` : stderr,
      });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
  });
}
