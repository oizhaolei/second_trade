/**
 * 订单相关
 */

const config = require('../config.json');
const logger = require('log4js').getLogger('routers/o.js');

const express = require('express');
const mdb = require('../mongoose.js');

const router = express.Router();
/**
 * 必须是已注册用户
 */
const isValidSession = session =>
      session.openid && session.user;

/**
 * 商品
 */
router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    if (id === 'new') { //new
      res.render('product_new');
      return;
    }
    //find
    const product = await mdb.Product.findById(id);
    res.render('product', {
      product,
    });
  } catch (err) {
    logger.error(err);
    res.render('product_new');
  }
});

router.get('/:id/:action', async(req, res, next) => {
  if (!isValidSession(req.session)) {
    res.redirect('/');
    return;
  }

  try {
    const id = req.params.id;
    const action = req.params.action;

    if (action === 'pub') { // 我要发布
    } else if (action === 'leave_comment') { // 留言
    } else if (action === 'reply_comment') { // reply
    } else {
      res.redirect(`/product/${id}`);
    }
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
  logger.debug('create product:', product);
  // save to mongo
  const dbProduct = new mdb.Product(product);
  await dbProduct.save();

  req.session.msg = 'Product新建成功!';
  res.redirect(`/product/${dbProduct._id}`);


});
router.post('/:id/:action', async(req, res, next) => {
  if (!isValidSession(req.session)) {
    res.redirect('/');
    return;
  }

  try {
    const id = req.params.id;
    const action = req.params.action;

    if (action === 'new') { // 我要发布
      const body = req.body;
    } else if (action === 'leave_comment') { // 留言
      const comment = req.body.comment;
    } else if (action === 'reply_comment') { // reply
      const comment = req.body.comment;
    } else if (action === 'pay') { // 下定金
      const fee = req.body.fee;
    } else {
      res.redirect(`/product/${id}`);
    }
  } catch (err) {
    logger.error(err);
    next(err);
  }
});


//change store auth
router.post('/upload', (req, res, next) => {
  const mediaid = req.body.mediaid;

  nwa.determine(config.app, (err, authData) => {
    const picurl = `http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=${authData.accessToken}&media_id=${mediaid}`;
    const filename = `${mediaid}.jpg`;
    const sourceFile = path.join(config.tmpdir, filename);
    const sourceFs = fs.createWriteStream(sourceFile);
    request(picurl).pipe(sourceFs);
    sourceFs.on('finish', () => {
      const dest = `original/${filename}`;
      oss.putObject(sourceFile, dest, 'image/jpeg', (err, data) => {
        if (err) {
          logger.error(err);
        } else {
          const val = `http://file2-tttalk-org.oss-cn-hangzhou.aliyuncs.com/original/${filename}`;
          //更新数据
          res.send(val);
        }
      });
    });
  });
});

module.exports = router;
