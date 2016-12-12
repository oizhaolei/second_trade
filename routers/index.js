//首页的4个Tab入口
const config = require('../config.json');
const logger = require('log4js').getLogger('routers/index.js');

const _ = require('lodash');
const util = require('util');

const express = require('express');

const nwApi = require('node-weixin-api');

const mdb = require('../mongoose.js');
const redis = require('promise-redis')();

const router = express.Router();
const nwo = nwApi.oauth;
const redisClient = redis.createClient(_.extend(config.redis, {
  retry_strategy: require('../lib/utilities.js').redis_retry_strategy,
}));

const nws = require('../lib/wxsettings').nws;

router.post('/log', (req, res) => {
  logger.info(req.body);
  res.end();
});

router.get('/oauth', (req, res, next) => {
  logger.info(req.query);
  const action = req.query.action;
  nwo.success(config.app, req.query.code, (err, body) => {
    logger.info('body:', body);
    logger.info('nwo.session:', nwo.session);

    if (err) {
      logger.error('nwo err:', err, body);
      next(err);
    } else {
      const openid = body.openid;
      const access_token = body.access_token;

      nwo.profile(openid, access_token, async(error, body2) => {
        logger.info('body2:', body2);

        // save to mongo
        await mdb.User.update({
          openid,
        }, body2, {
          upsert: true,
          setDefaultsOnInsert: true,
        });
        const me = await mdb.User.findOne({
          openid,
        });
        req.session.openid = openid;
        req.session.user = me;

        res.redirect(action);
      });
    }
  });
});

const redirectOAuth = (req, res, gourl) => {
  const redirectUri = util.format(config.oauth_redirect, encodeURIComponent(gourl));
  const state = 1;
  const userInfo = 1;
  const url = nwo.createURL(config.app.id, redirectUri, state, userInfo);
  logger.info('url:', url);
  res.redirect(url);
};

const isValidSession = session => session.openid;

router.get('/', (req, res, next) => {
  if (!isValidSession(req.session)) {
    redirectOAuth(req, res, req.url);
    return;
  }

  res.redirect('/main');
});

/**
   主Tab:信息一览
*/
router.get('/main', (req, res) => {
  if (!isValidSession(req.session)) {
    redirectOAuth(req, res, req.url);
    return;
  }
  res.render('tab_main');
});

/**
 我的
 */
router.get('/me', async (req, res, next) => {
  if (!isValidSession(req.session)) {
    redirectOAuth(req, res, req.url);
    return;
  }
  try {
    const me = await mdb.User.findOne({
      openid: req.session.openid,
    });
    res.render('tab_me', {
      user: me,
    });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

module.exports = router;
