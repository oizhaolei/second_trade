const config = require('../config.js');

const logger = require('log4js').getLogger('lib/wxsettings.js');
const nws = exports.nws = require('node-weixin-settings');
const _ = require('lodash');
const redis = require('promise-redis')();

const utilities = require('../lib/utilities.js');

const redisClient = redis.createClient(_.extend(config.redis, {
  retry_strategy: utilities.redis_retry_strategy,
}));

const prefix = 'wx_';
nws.registerSet((id, key, value, cb) => {
  logger.debug('registerSet %s %s %s', id, key, JSON.stringify(value));
  const k = `${prefix}${id}_${key}`;
  redisClient.set(k, JSON.stringify(value));
  redisClient.expire(k, ((2 * 60 * 60) - 60)); // 2h - 60s
  cb(null);
});
nws.registerGet(async(id, key, cb) => {
  let value = null;
  try {
    const k = `${prefix}${id}_${key}`;
    const v = await redisClient.get(k);
    value = JSON.parse(v);
  } catch (e) {
    logger.error(e);
  }
  cb(value);
});
