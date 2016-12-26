module.exports = {
  host: '127.0.0.1',
  port: 3000,
  session_secret: '19f508c900d840c408202e9e78a166bc',

  tmpdir: '/work/tmp',

  title: '二手交易',
  desc: 'dlmu',
  url: 'https://wx.ydw123.cn/',
  oauth_redirect: 'https://wx.ydw123.cn/oauth?action=%s',

  app: {
    id: 'wx5af8155819acc93e',
    secret: '1efaef496dc1ea52a1ce7961c8737227',
    token: '0f3fe2e8b2e7599185cbc740e5f8b0be'
  },
  merchant: {
    id: '1295556701',
    key: 'ke036bc2cd9dc80br609017756ccu489'
  },
  spbill_create_ip: '123.57.221.177',
  wxpay_noti_url: 'https://wx.ydw123.cn/wxpay/noti',

  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: 'huarui1111'
  },
  smtp: 'smtp://kefu%40ydw123.cn:AliTest12301@smtp.ydw123.cn',


  pageSize: 10,

  mongoose: {
    connect: 'mongodb://localhost/secondhands'
  },


  aliyun: {
    prefix: '//youdewan-test.oss-cn-hangzhou.aliyuncs.com',
    cdn_prefix: '//cdn.bootcss.com',
    static_content: '',
    thumb_img_prefix: '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/thumb120',
    toy_img_prefix: '//youdewan-test.oss-cn-hangzhou.aliyuncs.com/tmp',
    oss: {
      bucket: 'youdewan-test',
      accessKeyId: 'IZt8IqsqDhxI6055',
      secretAccessKey: 'njtsCs5MCYSk4hwZUI3Ss4kNbLIQnt',
      endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
      apiVersion: '2013-10-15'
    }
  },
  acl: {
    enabled: true,
    roles: [
    ],
    resources: [
    ]
  }
}
