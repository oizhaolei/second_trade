/**
 * Handlebars的帮助
 */
const config = require('../config.json');
const logger = require('log4js').getLogger('lib/handlebars_helper.js');

const util = require('util');
const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');

exports.helper = {
  eq: (v1, v2) => v1 === v2,
  ne: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and: (v1, v2) => v1 && v2,
  or: (v1, v2) => v1 || v2,
  add: (v1, v2) => v1 + v2,
  minus: (v1, v2) => v1 - v2,
  multiply: (v1, v2) => parseInt(v1 * v2, 10),
  contains: (s, v) => s && ((s === v) || (s.split(',').indexOf(v) > -1)),
  exists: (list, key) => list.indexOf(key) > -1,
  divide: (v1, v2) => v1 / v2,
  now: f => moment().format(f),
  now_add: (n, unit, f) => moment().add(n, unit).format(f),
  ymd: (date, f) => moment(date).format(f),
  ymd_add: (date, n, unit, f) => moment(date).add(n, unit).format(f),
  not: v1 => !v1,
  toJSON: object => JSON.stringify(object),
  format: (str, arg) => util.format(str, arg),
  minute2hms: (timer) => {
    const t = timer * 60;
    const h = parseInt(t / 3600, 10);
    const m = parseInt((t % 3600) / 60, 10);
    const s = parseInt(t % 60, 10);

    const hours = h < 10 ? `0${h}` : h;
    const minutes = m < 10 ? `0${m}` : m;
    const seconds = s < 10 ? `0${s}` : s;

    return `${hours}:${minutes}:${seconds}`;
  },
  km2meter: km =>
    numeral(parseInt(km * 1000, 10)).format('0,0'),
  lte_order_status: (v1, v2) =>
    _.indexOf(config.order_statuses, v1) <= _.indexOf(config.order_statuses, v2),
  gte_order_status: (v1, v2) =>
    _.indexOf(config.order_statuses, v1) >= _.indexOf(config.order_statuses, v2),
  // '箱格','已预约','已借出', '归还中', '在库'
  location_status_title: (pack) => {
    const location_status = pack.location_status;
    return location_status === '箱格' ? '可借' : '不可借';
  },
  // 0:大箱 1:中箱 2:小箱 3:冰箱
  box_type_title: (pack) => {
    const box_type = pack.box_type;
    const mapper = config.mapper.box_type;
    return mapper[box_type];
  },
  times: (n, block) => {
    let accum = '';
    for (let i = 0; i < n; i += 1) {
      accum += block.fn(i);
    }
    return accum;
  },
  reverse_each: (n, block) => {
    let ret = '';

    if (n && n.length > 0) {
      for (let i = n.length - 1; i >= 0; i -= 1) {
        ret += block.fn(n[i]);
      }
    } else {
      ret = block.inverse(this);
    }
    return ret;
  },
  // 玩具包的名称，从包里的玩具和数量取得
  pack_name: (pack) => {
    const toySerials = pack.toySerials;
    if (toySerials) {
      return _.join(
        _.map(_.countBy(_.map(toySerials, 'toy.brand_name')), (v, k) =>
          `${k}*${v}`),
        ' '
      );
    }
    return '-';
  },
  // 玩具包的名称，从包里的玩具和数量取得
  pack_price: (pack) => {
    const toySerials = pack.toySerials;
    if (toySerials) {
      return _.sum(_.map(toySerials, 'toy.market_price'));
    }
    return 0;
  },
  zmxy_title: (score) => {
    for (const level of config.zmxy.levels) {
      if (score < level.lt) {
        return level.title;
      }
    }
    return '意外';
  },
};
