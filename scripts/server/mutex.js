/**
 * Simple async mutex for single-threaded Node.js.
 * Provides atomic tryAcquire/release to prevent TOCTOU races
 * on flags like activeGenerate across async route handlers.
 */
export class AsyncMutex {
  #locked = false;

  /**
   * Atomically acquire the mutex.
   * Returns true if acquired, false if already held.
   * Because Node.js is single-threaded, the check-and-set is atomic
   * as long as no `await` sits between check and set.
   */
  tryAcquire() {
    if (this.#locked) return false;
    this.#locked = true;
    return true;
  }

  /** Release the mutex. */
  release() {
    this.#locked = false;
  }

  /** Whether the mutex is currently held. */
  get isLocked() {
    return this.#locked;
  }
}
