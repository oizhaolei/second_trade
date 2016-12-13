const config = require('../config.json');
const logger = require('log4js').getLogger('lib/oss.js');
const fs = require('fs');
const ALY = require('aliyun-sdk');

const oss = new ALY.OSS(config.aliyun.oss);

const putObject = (source, dest, contentType, callback) => {
  logger.debug('putObject %s to %s', source, dest);
  fs.readFile(source, (err, data) => {
    if (err) {
      logger.error('fs.readFile error', source, dest, JSON.stringify(err));
      return;
    }

    oss.putObject({
      Bucket: config.aliyun.oss.bucket,
      Key: dest,
      Body: data,
      AccessControlAllowOrigin: '',
      ContentType: contentType,
      CacheControl: 'no-cache', // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
      ContentDisposition: '', // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
      ContentEncoding: 'utf-8', // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
      ServerSideEncryption: 'AES256',
      Expires: (new Date()).getTime() + (3600 * 1000), // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
    }, (e, d) => {
      if (e && e.code !== 200) {
        logger.error('oss error', e, d);
        callback(e, d);
      } else {
        callback(null);
      }
    });
  });
};
exports.putObject = putObject;

const deleteObject = (key, callback) => {
  logger.debug('deleteObject %s', key);
  oss.deleteObject({
    Bucket: config.aliyun.oss.bucket,
    Key: key,
  }, (err, data) => {
    callback(err, data);
  });
};

exports.deleteObject = deleteObject;
