// 微信优惠券
const config = require('../config.js');
const logger = require('log4js').getLogger('lib/wxservice.js');
const nwApi = require('node-weixin-api');

const EVENT_WEIXIN_API_RESULT = 'weixin_api_result';
const EventEmitter = require('events').EventEmitter;

const event = new EventEmitter();
event.on(EVENT_WEIXIN_API_RESULT, (errcode, errmsg, var1, var2) => {
  logger.info('%s, %s, %s, %s', errcode, errmsg, var1, var2);
  switch (errcode) {
    case 40001:
    // TODO
      break;
    default:
    //
  }
});

const nwm = nwApi.message;
//
module.exports = class WxService {

  constructor(app) {
    this.app = app;
    this.service = nwm.service;
    this.template = nwm.template;
  }

  text(settings, openid, msg, callback) {
    logger.info('text: %s, %s', openid, msg);
    this.service.api.text(settings, this.app, openid, msg, (err, data) => {
      event.emit(EVENT_WEIXIN_API_RESULT, data.errcode, data.errmsg);
      logger.info('wxservice.text:', openid, msg, err, data);
      if (callback) {
        callback(err, data);
      }
    });
  }

  image(settings, openid, mediaId, callback) {
    logger.info('image: %s, %s', openid, mediaId);
    this.service.api.image(settings, this.app, openid, mediaId, (err, data) => {
      event.emit(EVENT_WEIXIN_API_RESULT, data.errcode, data.errmsg);
      logger.info('wxservice.image:', openid, mediaId, err, data);
      callback(err, data);
    });
  }

  sendtemplate(settings, openid, templateId, url, data, callback) {
    logger.info('sendtemplate: %s, %s, %s, %s', openid, templateId, url, data);
    this.template.send(settings, this.app, openid, templateId, url, data, (err, d) => {
      event.emit(EVENT_WEIXIN_API_RESULT, d.errcode, d.errmsg);
      logger.info('wxservice.template:', openid, templateId, url, err, d);
      callback(err, d);
    });
  }
};
