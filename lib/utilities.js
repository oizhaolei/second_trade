/**
 * Handlebars的帮助
 */
const config = require('../config');
const logger = require('log4js').getLogger('lib/utilities');

const util = require('util');
const _ = require('lodash');
const moment = require('moment');
const numeral = require('numeral');

exports.helper = {
  eq: (v1, v2) => v1 === v2,
  about_eq: (v1, v2) => {
    if (v1 && v2) {
      return v1.toString() == v2.toString();
    }
    return false;
  },
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
  exists: (list, key) => (list ? list.indexOf(key) > -1 : false),
  divide: (v1, v2) => v1 / v2,
  abbr: (v, length) => {
    if (v) {
      return `${v.substring(0, length)}${v.length > length ? '...' : ''}`;
    }
    return '';
  },
  currency_format: currency => numeral(parseInt(currency)).format('0,0') + '元',
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
  city2region: (city) => {
    const mapper = config.mapper.city2region;
    return mapper[city] ? mapper[city] : 440300;
  },
  lte_order_status: (v1, v2) =>
    _.indexOf(config.order_statuses, v1) <= _.indexOf(config.order_statuses, v2),
  gte_order_status: (v1, v2) =>
    _.indexOf(config.order_statuses, v1) >= _.indexOf(config.order_statuses, v2),
  // '箱格','已预约','已借出', '归还中', '在库'
  sex_title: sex => (sex === 1 ? '男' : '女'),
  location_status_title: location_status => (location_status === '箱格' ? '可借' : '不可借'),
  parts_quantity: parts => _.sum(_.map(parts, 'quantity')),
  parts_weight: parts => _.sum(
      _.map(
        parts, part => part.quantity * (part.category === '特殊件' ? 3 : 1)
      )
    ),
  // 0:大箱 1:中箱 2:小箱 3:冰箱
  box_type_title: (box_type) => {
    const mapper = config.mapper.box_type;
    return mapper[box_type];
  },
  user_type_title: (user_type) => {
    const mapper = config.mapper.user_type;
    return mapper[user_type];
  },
  reg_expired_date: (user_type, last_reg_date) => { // 到期时间
    if (user_type === 'guest') return moment().format('YYYY-MM-DD'); // guest用户的话，今天
    const nextRegDate = moment(last_reg_date).add(1, user_type === 'u_year' ? 'years' : 'months').format('YYYY-MM-DD');
    return nextRegDate;
  },
  renewal_start_date: (reg_expired_date) => { // 续费起始时间
    const today = moment(); // 今天
    return moment(reg_expired_date).isAfter(today) ? reg_expired_date : today;
  },
  is_reg_expired: (user_type, last_reg_date) => {
    if (user_type === 'guest') return false; // guest用户的话，没有过期的概念

    const deadline = moment(last_reg_date).add(1, user_type === 'u_year' ? 'years' : 'months');

    return deadline.isBefore(moment());
  },
  is_about_expired(user_type, last_reg_date) {
    if (user_type === 'guest') return false; // guest用户的话，没有过期的概念

    const deadline = moment(last_reg_date).add(1, user_type === 'u_year' ? 'years' : 'months').subtract(config.user_expire_attention_days, 'days');

    return deadline.isBefore(moment());
  },
  dueZmxyDeposit(zm_score, zm_deposit) { // 此用户的芝麻信用，押金，来判断此用户是否可信
    for (const level of config.zmxy.levels) {
      if (zm_score < level.lt) {
        if (!level.deposit || level.deposit === 0) {
          return 0;
        }
        return level.deposit - zm_deposit;
      }
    }
    return 0;
  },
  time_passed: (time) => {
    if (time) {
      return parseInt(moment().diff(moment(time)) / 60000, 10);
    }
    return 0;
  },
  open_code_time_left: (open_code_time) => {
    if (open_code_time) {
      return config.open_expired_minute - parseInt(moment().diff(moment(open_code_time)) / 60000, 10);
    }
    return config.open_expired_minute;
  },
  first_check_time_left: (open_time) => {
    if (open_time) {
      return config.part_miss_expired_minute - parseInt(moment().diff(moment(open_time)) / 60000, 10);
    }
    return config.part_miss_expired_minute;
  },
  resv_return_time_left: (resv_return_time) => {
    if (resv_return_time) {
      return config.return_expired_minute - parseInt(moment().diff(moment(resv_return_time)) / 60000, 10);
    }
    return config.return_expired_minute;
  },
  order_status_title: (order_status) => {
    const mapper = config.mapper.order_status;
    return mapper[order_status];
  },
  resv: (resvs) => {
    if (resvs && resvs.length > 0) {
      return resvs[resvs.length - 1];
    }
    return undefined;
  },
  open: (opens) => {
    if (opens && opens.length > 0) {
      return opens[opens.length - 1];
    }
    return undefined;
  },
  status_title: (status) => {
    const mapper = config.mapper.order_resv_status;
    return mapper[status];
  },
  // 玩具包的名称，从包里的玩具和数量取得
  pack_name: (toySerials) => {
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
  pack_price: (toySerials) => {
    if (toySerials) {
      return _.sum(_.map(toySerials, 'toy.market_price'));
    }
    return 0;
  },
  //匹配e栈的箱子类型
  change_eslife_box_type : (box_type) => {
    if(box_type == 0){
      return 'big';
    } else if(box_type == 1){
      return 'medium';
    } else if(box_type == 2){
      return 'small';
    } else if(box_type == 3){
      return 'fresh';
    } else{
      return 'mini';
    }
  },
  zmxy_title: (score) => {
    for (const level of config.zmxy.levels) {
      if (score < level.lt) {
        return level.title;
      }
    }
    return '意外';
  },
  evaluation_title: (evaluation) => {
    const mapper = config.mapper.evaluation;
    return mapper[evaluation];
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

  times: (n, block) => {
    let accum = '';
    for (let i = 0; i < n; i += 1) {
      accum += block.fn(i);
    }
    return accum;
  },
  age: (date) => {
    if (date) {
      return moment().diff(moment(date), 'years');
    }
    return 0;
  },
};

// redis的retry策略
exports.redis_retry_strategy = (options) => {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    return new Error('The server refused the connection');
  }
  if (options.total_retry_time > 1000 * 60 * 60) {
    return new Error('Retry time exhausted');
  }
  if (options.times_connected > 10) {
    return undefined;
  }
  // reconnect after
  return Math.max(options.attempt * 100, 3000);
};
