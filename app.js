const OSS = require("ali-oss")
const LocalStrategy = require('passport-local').Strategy;
class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad(a) {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
    // 注意：此函数只支持同步调用
  }

  async beforeStart(app) {
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
    const { app } = this
    // 挂载 strategy
    app.passport.use(new LocalStrategy({
      passReqToCallback: true,
    }, (req, username, password, done) => {
      console.log(username, password);
      // format user
      const user = {
        provider: 'local',
        username,
        password,
      };
      // let passport do verify and call verify hook
      app.passport.doVerify(req, user, done);
    }));

    // 处理用户信息
    app.passport.verify(async (ctx, user) => {
      console.log(user)
    });
    app.passport.serializeUser(async (ctx, user) => {
      console.log(user)
    });
    app.passport.deserializeUser(async (ctx, user) => {
      console.log(user)
    });
  }

  async willReady() {
    // 所有的插件都已启动完毕，但是应用整体还未 ready
    // 可以做一些数据初始化等操作，这些操作成功才会启动应用
  }

  async didReady() {
    // 应用已经启动完毕
    this.app.ossClient = new OSS({
      region: 'oss-cn-hangzhou',
      // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
      // accessKeyId: 'LTAIp2d1lrbhVlo6',
      // accessKeySecret: 'AnzFTZL25nddBhaJ4VqrLu9jrY5Hjk',
      accessKeyId: 'STS.NUAQb4FfGVekNKmu25nkwn1rP',
      accessKeySecret: '3Ef2C8sdhDsCiXsHBpeGauRRrF7y5fRneraDu1VqVh9D',
      bucket: 'penglai-weimall',
      // 是否使用https
      secure: false
    })
  }

  async serverDidReady() {
    // http / https server 已启动，开始接受外部请求
    // 此时可以从 app.server 拿到 server 的实例
  }
}

module.exports = AppBootHook;
