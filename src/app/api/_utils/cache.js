class Cache {
  constructor() {
    this.cache = {};
  }

  get(key) {
    return this.cache[key] ? this.cache[key].data : null;
  }

  set(key, data, timeout = 120 * 1000) {
    if (this.cache[key] && this.cache[key].timeout) {
      clearTimeout(this.cache[key].timeout);
    }

    this.cache[key] = {
      data: data,
      timeout: setTimeout(() => this.delete(key), timeout),
    };
  }

  delete(key) {
    delete this.cache[key];
  }
}

module.exports = new Cache();
