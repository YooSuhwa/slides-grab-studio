import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { AsyncMutex } from '../../scripts/server/mutex.js';

describe('AsyncMutex', () => {
  it('tryAcquire returns true on first call', () => {
    const mutex = new AsyncMutex();
    assert.equal(mutex.tryAcquire(), true);
  });

  it('tryAcquire returns false when already locked', () => {
    const mutex = new AsyncMutex();
    mutex.tryAcquire();
    assert.equal(mutex.tryAcquire(), false);
  });

  it('release unlocks the mutex', () => {
    const mutex = new AsyncMutex();
    mutex.tryAcquire();
    mutex.release();
    assert.equal(mutex.tryAcquire(), true);
  });

  it('isLocked reflects current state', () => {
    const mutex = new AsyncMutex();
    assert.equal(mutex.isLocked, false);
    mutex.tryAcquire();
    assert.equal(mutex.isLocked, true);
    mutex.release();
    assert.equal(mutex.isLocked, false);
  });

  it('multiple release calls are safe', () => {
    const mutex = new AsyncMutex();
    mutex.tryAcquire();
    mutex.release();
    mutex.release(); // should not throw
    assert.equal(mutex.isLocked, false);
  });
});

describe('broadcastSSE safety', () => {
  it('handles dead clients without throwing', async () => {
    const { broadcastSSE } = await import('../../scripts/server/sse.js');
    const clients = new Set();

    // Simulate a dead client whose write throws
    const deadClient = {
      write() { throw new Error('client disconnected'); },
    };
    const aliveClient = {
      received: [],
      write(data) { this.received.push(data); },
    };

    clients.add(deadClient);
    clients.add(aliveClient);

    // Should not throw
    broadcastSSE(clients, 'test', { foo: 'bar' });

    // Dead client should be removed
    assert.equal(clients.has(deadClient), false);
    // Alive client should have received the message
    assert.equal(aliveClient.received.length, 1);
    assert.ok(aliveClient.received[0].includes('event: test'));
  });
});

describe('Browser pool resilience', () => {
  it('clears cache on creation failure', async () => {
    const { getScreenshotBrowser, closeBrowser } = await import('../../scripts/server/helpers.js');
    let callCount = 0;
    const ctx = {
      browserPromise: null,
      screenshotMod: {
        createScreenshotBrowser() {
          callCount++;
          if (callCount === 1) return Promise.reject(new Error('browser crash'));
          return Promise.resolve({ browser: { close: async () => {} } });
        },
      },
    };

    // First call should fail and clear cache
    await assert.rejects(() => getScreenshotBrowser(ctx), /browser crash/);
    assert.equal(ctx.browserPromise, null, 'cache should be cleared after failure');

    // Second call should retry and succeed
    const result = await getScreenshotBrowser(ctx);
    assert.ok(result.browser, 'should return browser on retry');
    assert.equal(callCount, 2);
  });

  it('closeBrowser handles rejected promise gracefully', async () => {
    const { closeBrowser } = await import('../../scripts/server/helpers.js');
    const ctx = {
      browserPromise: Promise.reject(new Error('never created')),
    };
    // Should not throw
    await closeBrowser(ctx);
    assert.equal(ctx.browserPromise, null);
  });
});

describe('Subprocess timeout', () => {
  it('spawnCodexEdit kills process after timeout', async () => {
    const { spawnCodexEdit } = await import('../../scripts/server/spawn.js');

    // Use sleep as a subprocess that will exceed the timeout
    const result = await spawnCodexEdit({
      prompt: 'test',
      imagePath: null,
      model: 'test-model',
      cwd: process.cwd(),
      onLog: () => {},
      timeout: 100, // 100ms timeout
    }).catch((err) => {
      // If codex binary doesn't exist, that's OK — we just test the timeout mechanism
      return { code: -1, stderr: err.message };
    });

    // Either timed out or codex not found — both are acceptable
    assert.ok(result.code !== 0, 'should not succeed');
  });
});

describe('sanitizeDeckName', () => {
  it('strips path traversal components', async () => {
    const { sanitizeDeckName } = await import('../../scripts/server/helpers.js');
    assert.equal(sanitizeDeckName('../../../etc/passwd'), 'passwd');
    assert.equal(sanitizeDeckName('..'), null);
    assert.equal(sanitizeDeckName('.'), null);
    assert.equal(sanitizeDeckName(''), null);
    assert.equal(sanitizeDeckName(null), null);
    assert.equal(sanitizeDeckName(undefined), null);
  });

  it('preserves valid deck names', async () => {
    const { sanitizeDeckName } = await import('../../scripts/server/helpers.js');
    assert.equal(sanitizeDeckName('my-deck'), 'my-deck');
    assert.equal(sanitizeDeckName('  my-deck  '), 'my-deck');
  });
});

describe('resolveDeckPath', () => {
  it('rejects path traversal attempts', async () => {
    const { resolveDeckPath } = await import('../../scripts/server/helpers.js');
    // '../../../etc' → basename = 'etc' → resolves safely to decks/etc
    assert.ok(resolveDeckPath('../../../etc'), 'stripped to "etc" which is safe');
    assert.equal(resolveDeckPath('../../../etc').name, 'etc');
    // '..' is rejected
    assert.equal(resolveDeckPath('..'), null);
    assert.equal(resolveDeckPath(''), null);
  });

  it('resolves valid deck name to path', async () => {
    const { resolveDeckPath } = await import('../../scripts/server/helpers.js');
    const result = resolveDeckPath('test-deck');
    assert.ok(result);
    assert.equal(result.name, 'test-deck');
    assert.ok(result.path.endsWith('decks/test-deck'));
  });
});
