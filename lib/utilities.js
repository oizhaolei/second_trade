// redis的retry策略
exports.redis_retry_strategy = (options) => {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    return new Error('The server refused the connection');
  }
  if (options.total_retry_time > 1000 * 60 * 60) {
    return new Error('Retry time exhausted');
  }
  if (options.times_connected > 10) {
    return undefined;
  }
  // reconnect after
  return Math.max(options.attempt * 100, 3000);
};
