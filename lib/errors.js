const logger = require('log4js').getLogger('lib/error.js');
/**
 * Error middlewares
 */

module.exports = (parentApp) => {
  // catch 404 and forward to error handler
  parentApp.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers
  parentApp.use((err, req, res, next) => {
    if (err && err.status !== 404) logger.error(err);

    res.status(err.status || 500);

    res.render('error', {
      msg: err.message,
      error: {},
    });
  });
};
