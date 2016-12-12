const config = require('./config.json');
const logger = require('log4js').getLogger('app.js');
const _ = require('lodash');
const path = require('path');

const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(config.port);

const socketHelper = require('./lib/socket_helper.js');
const appHelper = require('./lib/app_helper.js');
const handlebarsHelper = require('./lib/handlebars_helper.js');

io.on('connection', socket => socketHelper.helper(socket));

const exphbs = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const favicon = require('serve-favicon');
const methodOver = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errors = require('./lib/errors');
const redis = require('promise-redis')();

const redisClient = redis.createClient(_.extend(config.redis, {
  retry_strategy: require('./lib/utilities.js').redis_retry_strategy,
}));

// Config session
const redisStore = new RedisStore({
  client: redisClient,
});

app.use(session({
  store: redisStore,
  resave: true,
  saveUninitialized: true,
  secret: config.session_secret,
}));

// uncomment after placing your favicon in /public
app.use(cookieParser());
// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// allow overriding methods in query (?_method=put)
app.use(methodOver('_method'));

app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
// app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  logger.debug('\n----------- New Request ---------\nurl: %s\nquery: %s\nbody: %s\n--------------------------------- ', req.originalUrl, JSON.stringify(req.query), JSON.stringify(req.body));
  res.locals.config = config;
  res.locals.session = req.session;
  res.locals.req = req;
  res.locals.title = `${config.title} - ${config.desc}`;

  const msg = req.session.msg;
  delete req.session.msg;

  res.locals.msg = '';
  if (msg) res.locals.msg = msg;

  next();
});

app.use('/', require('./routers/index.js'));
app.use('/product', require('./routers/product.js')); // order
app.use('/u', require('./routers/u.js')); // user
app.use('/weixin', require('./routers/weixin.js'));
app.use('/test', require('./test/fake.js'));

appHelper.helper(app, io);

// Config Handlebars
const blocks = {};
const Handlebars = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '/views/layouts/'),
  partialsDir: path.join(__dirname, '/views/partials/'),
  helpers: _.extend({
    url(routeName, params) {
      return app.locals.url(routeName, params);
    },
    block(name) {
      const val = (blocks[name] || []).join('\n');

      // clear the block
      blocks[name] = [];
      return val;
    },
    extend(name, context) {
      let block = blocks[name];
      if (!block) {
        block = blocks[name] = [];
      }

      block.push(context.fn(this));
    },
  }, handlebarsHelper.helper),
});

// View engine setup
app.engine('handlebars', Handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Errors load
errors(app);
