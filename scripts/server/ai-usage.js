/**
 * AI Usage Tracker — logs AI call timing, token counts, and estimated costs to the terminal.
 *
 * Supports three token-reporting tiers:
 *   1. Exact — OpenAI SDK / Gemini API return real token counts
 *   2. Estimated — Claude CLI: approximate via chars / 4
 *   3. Unknown — no data available
 */

// ── Cost table (USD per 1M tokens) ──────────────────────────────────

const COST_TABLE = new Map([
  ['claude-opus-4-6',     { input: 15,    output: 75   }],
  ['claude-opus-4-5-20250918', { input: 15, output: 75 }],
  ['claude-sonnet-4-6',   { input: 3,     output: 15   }],
  ['claude-sonnet-4-5-20250514', { input: 3, output: 15 }],
  ['gpt-4o-mini',         { input: 0.15,  output: 0.6  }],
  ['gpt-4o',              { input: 2.5,   output: 10   }],
  ['gpt-4.1',             { input: 2,     output: 8    }],
  ['o4-mini',             { input: 1.1,   output: 4.4  }],
  ['gemini-3-pro-image-preview', { input: 0, output: 0 }],
]);

function lookupCost(model) {
  if (COST_TABLE.has(model)) return COST_TABLE.get(model);
  // Prefix match: "claude-opus-4-6" should match "claude-opus"
  for (const [key, val] of COST_TABLE) {
    if (model.startsWith(key.split('-').slice(0, 2).join('-'))) return val;
  }
  return null;
}

function estimateCostUsd(model, inputTokens, outputTokens) {
  const rate = lookupCost(model);
  if (!rate) return null;
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}

// ── Formatting helpers ──────────────────────────────────────────────

function fmtDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  let m = Math.floor(s / 60);
  let rem = Math.round(s % 60);
  if (rem === 60) { m++; rem = 0; }
  return `${m}m ${rem}s`;
}

function fmtTokens(n) {
  if (n == null) return '?';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtCost(usd) {
  if (usd == null) return '';
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

// ANSI colors (supported in all modern terminals)
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';

// ── Tracker factory ─────────────────────────────────────────────────

const MAX_RECENT_CALLS = 200;

export function createUsageTracker({ onFinish } = {}) {
  const calls = new Map();
  const recentCallIds = [];
  const session = {
    startedAt: new Date().toISOString(),
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalDurationMs: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalEstimatedCostUsd: 0,
    byOperation: {},
    byModel: {},
  };

  let callSeq = 0;

  function startCall(operation, model, { promptChars = 0 } = {}) {
    const callId = `ai-${++callSeq}-${Date.now()}`;
    calls.set(callId, {
      callId,
      operation,
      model,
      promptChars,
      startedAt: Date.now(),
    });
    recentCallIds.push(callId);
    while (recentCallIds.length > MAX_RECENT_CALLS) {
      const old = recentCallIds.shift();
      calls.delete(old);
    }

    console.log(`${CYAN}[AI] ${RESET}▶ ${operation} | ${model}`);
    return callId;
  }

  function finishCall(callId, { inputTokens = null, outputTokens = null, promptChars = 0, outputChars = 0, reportedCostUsd = null, numTurns = null, success = true } = {}) {
    const call = calls.get(callId);
    if (!call) return null;

    const durationMs = Date.now() - call.startedAt;
    const totalPromptChars = promptChars || call.promptChars || 0;

    // Determine token counts: use exact if available, otherwise estimate from chars
    let inTok = inputTokens;
    let outTok = outputTokens;
    let estimated = false;
    if (inTok == null && totalPromptChars > 0) {
      inTok = Math.round(totalPromptChars / 4);
      estimated = true;
    }
    if (outTok == null && outputChars > 0) {
      outTok = Math.round(outputChars / 4);
      estimated = true;
    }

    // Use reported cost from CLI if available, otherwise estimate from tokens
    const costUsd = reportedCostUsd != null
      ? reportedCostUsd
      : (inTok != null && outTok != null)
        ? estimateCostUsd(call.model, inTok, outTok)
        : null;

    // Update call record
    Object.assign(call, {
      durationMs,
      inputTokens: inTok,
      outputTokens: outTok,
      tokensEstimated: estimated,
      costUsd,
      numTurns,
      success,
      finishedAt: Date.now(),
    });

    // Update session totals
    session.totalCalls++;
    if (success) session.successfulCalls++;
    else session.failedCalls++;
    session.totalDurationMs += durationMs;
    if (inTok != null) session.totalInputTokens += inTok;
    if (outTok != null) session.totalOutputTokens += outTok;
    if (costUsd != null) session.totalEstimatedCostUsd += costUsd;

    // By operation
    if (!session.byOperation[call.operation]) {
      session.byOperation[call.operation] = { calls: 0, durationMs: 0, costUsd: 0 };
    }
    const opStats = session.byOperation[call.operation];
    opStats.calls++;
    opStats.durationMs += durationMs;
    if (costUsd != null) opStats.costUsd += costUsd;

    // By model
    if (!session.byModel[call.model]) {
      session.byModel[call.model] = { calls: 0, costUsd: 0 };
    }
    const modelStats = session.byModel[call.model];
    modelStats.calls++;
    if (costUsd != null) modelStats.costUsd += costUsd;

    // Terminal log
    const icon = success ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    const durStr = fmtDuration(durationMs);
    const estTag = estimated ? ` ${DIM}(prompt only)${RESET}` : '';
    const turnsStr = numTurns != null ? ` ${DIM}(${numTurns} turns)${RESET}` : '';

    let tokStr = '';
    if (inTok != null || outTok != null) {
      tokStr = ` | ~${fmtTokens(inTok)} in / ~${fmtTokens(outTok)} out${estTag}`;
    }

    let costStr = costUsd != null ? ` | ~${fmtCost(costUsd)}` : '';
    if (!success) {
      tokStr = '';
      costStr = ` | ${RED}FAILED${RESET}`;
    }

    console.log(`${CYAN}[AI] ${RESET}${icon} ${call.operation} | ${call.model} | ${durStr}${turnsStr}${tokStr}${costStr}`);

    // Session summary line
    const sCost = fmtCost(session.totalEstimatedCostUsd);
    const sDur = fmtDuration(session.totalDurationMs);
    console.log(`${DIM}[AI] ── session: ${session.totalCalls} calls | ${sDur} | ~${sCost} ──${RESET}`);

    // Callback for SSE broadcast
    onFinish?.(call, session);

    return call;
  }

  function getSessionSummary() {
    return { ...session };
  }

  function listRecentCalls(limit = 20) {
    return recentCallIds
      .slice(-limit)
      .map(id => calls.get(id))
      .filter(Boolean)
      .map(c => ({
        callId: c.callId,
        operation: c.operation,
        model: c.model,
        durationMs: c.durationMs,
        inputTokens: c.inputTokens,
        outputTokens: c.outputTokens,
        tokensEstimated: c.tokensEstimated,
        costUsd: c.costUsd,
        success: c.success,
      }));
  }

  return { startCall, finishCall, getSessionSummary, listRecentCalls };
}
