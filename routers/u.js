/**
 * user information
 */

const config = require('../config.js');
const logger = require('log4js').getLogger('routers/u.js');

const express = require('express');
const mdb = require('../mongoose.js');

const router = express.Router();

/**
 * 是已注册用户
 */
const isValidSession = session => session.openid;

// 历史记录 借还履历
router.get('/my_products', async (req, res, next) => {
  if (!isValidSession(req.session)) {
    res.redirect('/main');
    return;
  }

  const products = await mdb.Product.find({
    seller: req.session.user._id,
  }).sort('-_id').limit(config.pageSize);


  res.render('my_products', {
    products: products,
  });
});

module.exports = router;
