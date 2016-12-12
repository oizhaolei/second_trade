//night相关
const config = require('../config.json');
const logger = require('log4js').getLogger('routers/zmxy.js');

const moment = require('moment');

const express = require('express');
const mdb = require('../mongoose.js');

const router = express.Router();
const seed = moment().unix();

// 给当前用户的session加上必要的信息
router.get('/fake/:openid', async(req, res, next) => {
  const openid = req.params.openid;
  try {
    // user
    const me = await mdb.User.findOne({
      openid,
    });
    req.session.openid = me.openid;
    req.session.user = me;
    // save lat/lng

    res.redirect('/main');
  } catch (err) {
    logger.error(err);
    next(err);
  }
});


// 给当前用户的session加上必要的信息
router.get('/fake/new/:openid', async(req, res, next) => {
  const openid = req.params.openid;

  const body = {
    openid,
    nickname: `zhaolei_${seed}`,
    sex: 1,
    language: 'zh_CN',
    city: '大连',
    province: '辽宁',
    country: '中国',
    headimgurl: 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEL3Ge6Kqfv1xhrExpBp3iciba1UpWF3nx68jLvfOEV0My5KKhrU7JB96ytwsiaoiafLWXBibDiclN09nbzA/0',
    privilege: [],
  };
  try {
    // user
    const result = await mdb.User.update({
      openid,
    }, body, {
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json(result);
  } catch (err) {
    logger.error(err);
    next(err);
  }
});


module.exports = router;
