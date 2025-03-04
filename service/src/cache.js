export class InMemoryCache {
  #intervalId;
  #cache = new Map();

  /**
   * @param {number} evictionIntervalSeconds
   */
  constructor(evictionIntervalSeconds = 30) {
    this.#intervalId = setInterval(
      () => this.evict(),
      evictionIntervalSeconds * 1000
    );
  }

  /**
   * @param {string} key
   * @param {any} value
   * @param {{ttlSeconds: number}} options
   */
  set(key, value, options = { ttlSeconds: 30 }) {
    const expiresAt = Date.now() + options.ttlSeconds * 1000;
    this.#cache.set(key, { expiresAt, value });
  }

  get(key) {
    const entry = this.#cache.get(key);
    if (!entry) return [null, false];
    if (entry.expiresAt < Date.now()) {
      this.#cache.delete(key);
      return [null, false];
    }

    return [true, entry.value];
  }

  evict() {
    const now = Date.now();
    for (const [key, entry] of this.#cache.entries()) {
      if (entry.expiresAt < now) {
        console.debug("evicting ", key);
        this.#cache.delete(key);
      }
    }

    console.debug("finished eviction. Cache size is", this.#cache.size);
  }

  close() {
    clearInterval(this.#intervalId);
  }
}
