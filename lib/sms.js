/**
 * juhe短信API服务
 */
const config = require('../config.json');
const logger = require('log4js').getLogger('lib/sms.js');

const curl = require('curlrequest');

const send = (mobile, tpl_id, rand, cb) => {
  const url = `http://v.juhe.cn/sms/send?mobile=${mobile}&tpl_id=${tpl_id}&tpl_value=%23code%23%3D${rand}&key=${config.juhe.key}`;
  logger.info(url);
  if (config.juhe.enabled) {
    curl.request({
      url,
      method: 'GET',
    }, (err, results) => {
      cb(err, JSON.parse(results), rand);
    });
  } else {
    cb(null, {
      error_code: 0,
      reason: rand,
    }, rand);
  }
  return rand;
};

exports.send = send;
