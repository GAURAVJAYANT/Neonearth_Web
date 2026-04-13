async function retry(fn, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
    }
  }
}

module.exports = { retry };
