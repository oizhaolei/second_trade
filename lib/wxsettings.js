const config = require('../config.json');

const logger = require('log4js').getLogger('lib/wxsettings.js');
const path = require('path');
const fs = require('fs');
const nws = exports.nws = require('node-weixin-settings');

const readFile = (filename) => {
  const buf = fs.readFileSync(path.join(config.tmpdir, filename), 'utf8');
  return buf;
};

const writeFile = (filename, str) => {
  fs.writeFileSync(path.join(config.tmpdir, filename), str, 'utf8');
};

const prefix = 'wx_';
nws.registerSet((id, key, value, cb) => {
  logger.debug('registerSet %s %s %s', id, key, JSON.stringify(value));
  writeFile(`${prefix}${id}_${key}`, JSON.stringify(value));
  cb(null);
});
nws.registerGet((id, key, cb) => {
  let value = null;
  try {
    value = JSON.parse(readFile(`${prefix}${id}_${key}`));
    logger.debug('registerGet %s %s %s', id, key, JSON.stringify(value));
  } catch (e) {
    logger.error(e);
  }
  cb(value);
});
