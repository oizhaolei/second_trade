/**
 * app的帮助
 */
const config = require('../config.js');
const logger = require('log4js').getLogger('lib/app_helper.js');

const _ = require('lodash');

const redis = require('promise-redis')();
const mdb = require('../mongoose.js');

const redisClient = redis.createClient(_.extend(config.redis, {
  retry_strategy: require('./utilities.js').redis_retry_strategy,
}));

exports.helper = (app, io) => {
  // 我的任务
  app.on('user_task_changed', async(openid, content, result) => {
    try {
      const res = await mdb.User.update({
        openid,
      }, {
        $push: {
          tasks: {
            $each: [{
              content,
              result,
            }],
            $position: 0,
          },
        },
      }, {
        upsert: true,
      });
      logger.debug('app.on user_task_changed:', openid, content, result, res);
    } catch (err) {
      logger.error(err);
    }
  });

  // 玩贝明细:记录上下级关系
  app.on('user_bonus_changed', async(openid, content, result) => {
    try {
      const res = await mdb.User.update({
        openid,
      }, {
        $push: {
          bonus: {
            $each: [{
              content,
              result,
            }],
            $position: 0,
          },
        },
      }, {
        upsert: true,
      });
      logger.debug('app.on user_bonus_changed:', openid, content, result, res);
    } catch (err) {
      logger.error(err);
    }
  });
};
