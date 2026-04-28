/**
 * Cancel route: POST /api/generate/cancel
 *
 * Aborts the active plan/revise/generate run by signalling its AbortController.
 * The actual subprocess teardown (SIGTERM → SIGKILL) and SSE generateFinished /
 * planFinished broadcast happen in the run's own finally block — this endpoint
 * just trips the signal and returns immediately.
 */
export function createCancelRouter(ctx) {
  const { express } = ctx;
  const router = express.Router();

  router.post('/api/generate/cancel', (_req, res) => {
    const active = ctx.activeAIRun;
    if (!active) {
      return res.status(404).json({ ok: false, error: 'No active run' });
    }
    try {
      active.abortController.abort();
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
    return res.json({ ok: true, runId: active.runId, type: active.type });
  });

  return router;
}
