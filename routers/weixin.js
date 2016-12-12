// 微信消息回调接口
const config = require('../config.json');
const logger = require('log4js').getLogger('routers/weixin.js');
const _ = require('lodash');

const express = require('express');

const nwApi = require('node-weixin-api');
const nwm = require('node-weixin-message');

const nws = require('../lib/wxsettings').nws;
const WxService = require('../lib/wxservice');

const wxservice = new WxService(config.app);

const redis = require('promise-redis')();

const router = express.Router();
const redisClient = redis.createClient(_.extend(config.redis, {
  retry_strategy: require('../lib/utilities.js').redis_retry_strategy,
}));

const errors = require('web-errors').errors;

// Start
router.all('/getsignature', (req, res) => {
  const url = req.body.url;
  logger.info('getsignature: %s', url);

  nwApi.jssdk.prepare(nws, config.app, url, (err, json) => {
    if (err) {
      throw new Error(json);
    }

    res.json(json);
  });
});

router.get('/', (req, res) => {
  const data = nwApi.auth.extract(req.query);
  nwApi.auth.ack(config.app.token, data, (error, d) => {
    if (!error) {
      res.send(d);
      return;
    }
    switch (error) {
      case 1:
        res.send(errors.INPUT_INVALID);
        break;
      case 2:
        res.send(errors.SIGNATURE_NOT_MATCH);
        break;
      default:
        res.send(errors.UNKNOWN_ERROR);
        break;
    }
  });
});

const messages = nwm.messages;
const reply = nwm.reply;

// 监听文本消息
messages.on.text((msg, res) => {
  logger.info(msg);

  const me = msg.ToUserName;
  const openid = msg.FromUserName;
  if (['hi', '你好'].indexOf(msg.Content) >= 0) {
    const text = reply.text(me, openid, `
欢迎来到有得玩的大家庭，我们鼓励分享，倡导让家里的闲置乐高玩具重塑价值，让更多娃有得玩，玩有所得\n
我猜你是一个爱玩的爸爸，想知道怎样才能让孩子开心的玩\n
我猜你也可能是个有爱的妈妈，不知道怎样才能让孩子与他人一起玩耍\n
不要着急，我们这里有一群和你一样的宝爸宝妈愿意和你来一起参与，共建大家有得玩的家\n
你可以点击→ http://url.cn/bRWLnY 查看如何有得玩\n
如果你还不知道怎么有得玩\n
那就点击→ http://url.cn/WvBU8c  进入有得玩微信群\n
来吧，我们在这里等你
`);
    res.send(text);
  } else {
    const transfer = reply.transfer_customer_service(me, openid);
    res.send(transfer);
  }
});

//
messages.on.image((msg, res) => {
  logger.info(msg);

  const me = msg.ToUserName;
  const openid = msg.FromUserName;
  const transfer = reply.transfer_customer_service(me, openid);
  res.send(transfer);
});
messages.on.voice((msg, res) => {
  logger.info(msg);

  const me = msg.ToUserName;
  const openid = msg.FromUserName;
  const transfer = reply.transfer_customer_service(me, openid);
  res.send(transfer);
});
messages.on.video((msg, res) => {
  logger.info(msg);

  const me = msg.ToUserName;
  const openid = msg.FromUserName;
  const transfer = reply.transfer_customer_service(me, openid);
  res.send(transfer);
});
messages.on.shortvideo((msg, res) => {
  logger.info(msg);

  const me = msg.ToUserName;
  const openid = msg.FromUserName;
  const transfer = reply.transfer_customer_service(me, openid);
  res.send(transfer);
});

const onLocation = (msg, res) => {
  logger.info(msg);
  const key = `location_${msg.FromUserName}`;
  redisClient.set(key, JSON.stringify({
    lat: msg.Latitude,
    lng: msg.Longitude,
  }));
  redisClient.expire(key, 10 * 24 * 60 * 60); // 10d
  res.send('');
};
messages.on.location(onLocation);
messages.on.link((msg, res) => {
  logger.info(msg);
  res.send('');
});
messages.event.on.location(onLocation);
messages.event.on.click((msg, res) => {
  logger.info(msg);
  res.send('');
});
messages.event.on.view((msg, res) => {
  logger.info(msg);
  res.send('');
});
messages.event.on.templatesendjobfinish((msg, res) => {
  logger.info(msg);
  res.send('');
});

// subscribe
messages.event.on.subscribe((msg, res) => {
  logger.info('subscribe received');
  logger.info(msg);
  const me = msg.ToUserName;
  const openid = msg.FromUserName;
  const text = reply.text(me, openid, '[爱心]欢迎加入世界顶尖玩具有得玩！[爱心] 想加入会员 http://mp.weixin.qq.com/s?__biz=MzI5NTExNDIzOQ==&mid=501141402&idx=1&sn=0667fc6864494f0f17f4630dabb9bcf0#rd 有问题可以添加咨询客服微信号:youdewankefu');
  res.send(text);

  let parent_id = 0;
  try {
    if (msg.EventKey.indexOf('qrscene_') === 0) {
      // 上级
      parent_id = msg.EventKey.substring(8).split('_')[0];
      logger.info('event.on.subscribe', openid, parent_id);
      // 建立上下级关系，并且发消息
    }
  } catch (e) {
  }
});

// unsubscribe
messages.event.on.unsubscribe((msg, res) => {
  res.send('success');
  logger.info('unsubscribe received');
  logger.info(msg);

  const openid = msg.FromUserName;
  logger.info('event.on.unsubscribe', openid);
});

// scan
messages.event.on.scan((msg, res) => {
  res.send('success');

  logger.info('scan received');
  logger.info(msg);
  const openid = msg.FromUserName;

  let parent_id = 0;
  try {
    if (msg.EventKey) {
      // 上级
      parent_id = msg.EventKey.split('_')[0];
      logger.info('event.on.scan', openid, parent_id);
      // 建立上下级关系，并且发消息
    }
  } catch (e) {
  }
});

router.post('/', (req, res) => {
  logger.info('POST /weixin');

  // 获取XML内容
  let xml = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    xml += chunk;
  });

  // 内容接收完毕
  req.on('end', () => {
    messages.onXML(xml, res);
  });
});

module.exports = router;
