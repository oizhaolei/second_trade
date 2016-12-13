const config = require('./config.json');
const logger = require('log4js').getLogger('mongoose.js');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect(config.mongoose.connect);
mongoose.Promise = global.Promise;
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'mongo connection error.'));

//User
const UserSchema = new Schema({
  openid: {
    unique: true,
    type: String,
  },
  delete_flag: Boolean,
  mobile_no: String,
  email: String,
  nickname: String,
  sex: Number,
  language: String,
  region: String,
  province: String,
  country: String,
  headimgurl: String,
  privilege: [String],
  balance: Number,
  point: Number,
  create_date: {
    type: Date,
    default: Date.now(),
  },
  participates: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
      card_no: Number,
      create_date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});
UserSchema.statics = {
  fetch(cb) {
    return this.find().exec(cb);
  },
  findOpenid(openid, cb) {
    return this.findOne({ openid }).exec(cb);
  },
  delUser(id, cb) {
    return this.remove({ _id: id }, cb);
  },
};

const User = exports.User = mongoose.model('User', UserSchema);

//Tag
const TagSchema = new Schema({
  name: String,
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  create_date: {
    type: Date,
    default: Date.now(),
  },
  update_date: {
    type: Date,
    default: Date.now(),
  },
});
const Tag = exports.Tag = mongoose.model('Tag', TagSchema);

//Product
const ProductSchema = Schema({
  Tag: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
  click_count: Number,
  product_detail: {
    product_name: String,
    product_desc: String,
    images: [
      String,
    ],
  },
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      content: String,
      reply: String,
      create_date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  create_date: {
    type: Date,
    default: Date.now(),
  },
  winner: {
    user_no: Number,
  },
});

ProductSchema.methods.echo = function () {
  logger.debug('say something...');
};

const Product = exports.Product = mongoose.model('Product', ProductSchema);
