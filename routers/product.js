/**
 * 订单相关
 */

const config = require('../config.js');
const logger = require('log4js').getLogger('routers/o.js');

const curl = require('curlrequest');
const path = require('path');
const fs = require('fs');
const nwApi = require('node-weixin-api');
const nws = require('../lib/wxsettings').nws;

const express = require('express');
const mdb = require('../mongoose.js');
const oss = require('../lib/oss');

const router = express.Router();
/**
 * 必须是已注册用户
 */
const isValidSession = session =>
      session.openid && session.user;

/**
 * 商品
 */
router.get('/new', async(req, res, next) => {
  //new
  res.render('product_new');
});

router.get('/comment/new/:product_id', async(req, res, next) => {
  const product_id = req.params.product_id;
  //new
  const product = await mdb.Product.findById(product_id);
  
  res.render('comment_new', {
    product
  });
});

router.get('/:_id', async (req, res, next) => {
  const _id = req.params._id;
  try {
    if (_id === 'new') { //new
      res.render('product_new');
      return;
    }
    //find
    const product = await mdb.Product
          .findById(_id)
          .populate('seller comments.user');
    res.render('product', {
      product,
    });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

router.post('/new', async(req, res, next) => {
  if (!isValidSession(req.session)) {
    res.redirect('/');
    return;
  }
  const product = req.body;
  product.seller = req.session.user._id;

  // TODO
  product.product_detail.images = [
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/2kS7H5Fe5j1M7r5zpmV-4GeS_3bCNUgjF8t9hXs6cAoZS2jzjFB-BDIouN8-_5zG.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/1VyrXHrMONKQ8Pm-RizQLM-OAg_NlK3LPqdgQpakpkUZIX4d4blo-WTNdLmgGBLq.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/Fgog_x6Ibw5SWdi-jx2KTVhiUbZ9IKuVtdgrByA7biUQ11CZDmJ_hQVHmdsVIAGm.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/gSWDIngfBW3xt8z7esPaeckzK98q7lqJczdCkr57yTYaGO5DZF8sVkBNSOu783ju.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/Hp2aYWSYDuLcnEbYyrqGJLFgAxSj3f9NXTk63yEusvObVm2tYwo79LVj22CXyHDF.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/diN0qDuzlNgHWqeuLxa39rUZT9vsd73696c3vVzqfstK3XbGdWrOpmk1_MY7R6vP.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/z3euxs7uxwrM3Bev4pRNeYTfNjnEeaD-loUaa_VffETZxLoumsJ7o6G4cYPN6mI8.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/boqumN9BLDFFedAZB3wMnEPDeAa8l_Uw_FVWzqL0gUG2OHrVsC75s_hHUOOoRABv.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/QLHa2ByU3CGLZCECvDsFayba0NHIJIHIaG54mpPgkcEeCqVT1QAsgqK2XjYqx_fN.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/R91TI8K6zor7kq0BJtyHL-_Uneuh5TuXzHtL00WmcY0mt2w9FticikvqPnpcEb0N.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/YGtHMmkQ3sikiEGqAkTufxAKYS_J3DDWWe6N5efqbkSjAyploup0ENpMG78rj82V.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/M21zcbhsIv0Ujw5IEfdqCSdYD4FhVkuMGKSrtRmSl1xszKR9XmYbTUCsyUqooWed.jpg',
    '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/ugc/siRlVdMCdvClR0_jMmIFX9EoGBtHru4H5TEfpYfJRiUaaPBLywxw6vmLDNYDDZXM.jpg',
  ];

  logger.debug('create product:', product);
  // save to mongo
  const dbProduct = new mdb.Product(product);
  try {
  await dbProduct.save();

  res.json({
    success: true,
    product: dbProduct,
  });
  } catch (err) {
    logger.error(err);
    res.json({
      success: false,
      data: err,
    });
  }
});

router.post('/comment', async(req, res, next) => {
  if (!isValidSession(req.session)) {
    res.redirect('/');
    return;
  }
  const content = req.body.content;
  try {
    //save
    const product = await mdb.Product.findByIdAndUpdate(req.body.product_id, {
      $push: {
        comments: {
          $each: [{
            content,
            user: req.session.user._id,
          }],
          $position: 0,
        },
      },
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
      new: true,
    });

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

router.post('/close/:product_id', async(req, res, next) => {
  if (!isValidSession(req.session)) {
    res.redirect('/');
    return;
  }

  try {
    //save
    const product = await mdb.Product.findByIdAndUpdate(req.params.product_id, {
      is_closed: true,
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
      new: true,
    });

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

//change store auth
router.post('/upload', (req, res) => {
  const mediaid = req.body.mediaid;
  try {
    nwApi.auth.determine(nws, config.app, (err) => {
      nws.get(config.app.id, 'auth', (authData) => {
        const picurl = `http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=${authData.accessToken}&media_id=${mediaid}`;
        const filename = `${mediaid}.jpg`;
        const local_file = path.join(config.tmpdir, filename);
        curl.request({
          url: picurl,
          encoding: null,
        }, (e1, data) => {
          if (e1) {
            throw e1;
          }
          fs.writeFile(local_file, data, (e2) => {
            if (e2) {
              throw e2;
            }
            logger.debug('saved: ', local_file);
            const dest = `ugc/${filename}`;
            oss.putObject(local_file, dest, 'image/jpeg', (e3) => {
              if (e3) {
                throw e3;
              } else {
                const val = `${config.aliyun.prefix}/${dest}`;
                res.json({
                  success: true,
                  image: val,
                });
              }
            });
          });
        });
      });
    });
  } catch (err) {
    logger.error(err);
    res.json({
      success: false,
      data: err,
    });
  }
});

module.exports = router;
