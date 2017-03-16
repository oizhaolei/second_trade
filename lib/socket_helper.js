/**
 * socket的帮助
 */
const config = require('../config.js');
const logger = require('log4js').getLogger('lib/socket_helper.js');

const _ = require('lodash');
const mdb = require('../mongoose.js');
const redis = require('promise-redis')();

const redisClient = redis.createClient(_.extend(config.redis, {
  retry_strategy: require('./utilities.js').redis_retry_strategy,
}));


exports.helper = (socket) => {
  logger.debug('user connected:', socket.id);

  socket.on('openid', (openid) => {
    logger.debug('user_socket hset :', openid, socket.id);
    const key = `user_socket${openid}`;
    redisClient.set(key, socket.id);
    redisClient.expire(key, 24 * 60 * 60); // 24h

    logger.debug(key, socket.id);
  });

  // 购买履历
  socket.on('query_my_products', async({ openid, page }) => {
    logger.debug('query_my_products', openid, page);
    try {
      const user = await mdb.User.findOne({
        openid,
      });

      const criteria = {
        seller: user,
      };

      logger.debug('criteria', criteria);

      const products = await mdb.Product
            .find(criteria).sort('-_id')
            .skip((page - 1) * config.pageSize)
            .limit(config.pageSize);

      socket.emit('query_my_products', products);
    } catch (err) {
      logger.error(err);
    }
  });

  // 商品列表
  socket.on('query_products', async({ openid, product_tag, page }) => {
    logger.debug('query_products', page, (page - 1) * config.pageSize, config.pageSize);
    try {
      let criteria = {
      };
      if (product_tag) {
        criteria = {
            'product_detail.product_tag': product_tag,
        }
      };
      const products = await mdb.Product
            .find(criteria).sort('-_id')
            .skip((page - 1) * config.pageSize)
            .limit(config.pageSize);

      socket.emit('query_products', products);
    } catch (err) {
      logger.error(err);
    }
  });

  socket.on('disconnect', () => {
    logger.debug('disconnect');
  });
};
