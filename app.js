const OSS = require('ali-oss')
const qiniu = require('qiniu')
const LocalStrategy = require('passport-local').Strategy
class AppBootHook {
    constructor(app) {
        this.app = app
    }

    configWillLoad(app) {
        // 此时 config 文件已经被读取并合并，但是还并未生效
        // 这是应用层修改配置的最后时机
        // 注意：此函数只支持同步调用
    }

    async beforeStart(app) {}

    async didLoad() {
        // 所有的配置已经加载完毕
        // 可以用来加载应用自定义的文件，启动自定义的服务
        const { app } = this
        // 挂载 strategy
        app.passport.use(new LocalStrategy({
            // 将请求信息传递到 callback 界面
            passReqToCallback: true
        }, (req, username, password, done) => {
            console.log(username, password)
            // format user
            const user = {
                provider: 'local',
                username,
                password
            }
            // let passport do verify and call verify hook
            app.passport.doVerify(req, user, done)
        }))

        // 校验用户
        app.passport.verify(async (ctx, user) => {
            console.log('authenticate', user)
            // 首次登录时，一般需要把用户信息进行入库，并记录 Session。
            // 二次登录时，从 OAuth 或 Session 拿到的用户信息，读取数据库拿到完整的用户信息。
            // 从数据库中查找用户信息
            //
            // Authorization Table
            // column   | desc
            // ---      | --
            // provider | provider name, like github, twitter, facebook, weibo and so on
            // uid      | provider unique id
            // user_id  | current application user id
            //
            // const auth = await ctx.model.Authorization.findOne({
            //   uid: user.id,
            //   provider: user.provider
            // })
            // const existsUser = await ctx.model.User.findOne({ id: auth.user_id })
            // if (existsUser) {
            //   return existsUser
            // }
            // // 调用 service 注册新用户
            // const newUser = await ctx.service.user.register(user)
            // return newUser
        })
        // 将用户信息序列化后存进 session 里面，一般需要精简，只保存个别字段
        app.passport.serializeUser(async (ctx, user) => {
            console.log(user)
        })
        // 反序列化后把用户信息从 session 中取出来，反查数据库拿到完整信息
        app.passport.deserializeUser(async (ctx, user) => {
            console.log(user)
        })
    }

    async willReady() {
        // 所有的插件都已启动完毕，但是应用整体还未 ready
        // 可以做一些数据初始化等操作，这些操作成功才会启动应用
    }

    async didReady() {
        // 应用已经启动完毕

        this.initQiniuOss()
        this.initAliOss()
    }

    async serverDidReady() {
        // http / https server 已启动，开始接受外部请求
        // 此时可以从 app.server 拿到 server 的实例
    }

    initQiniuOss() {
        const { qiniuConfig } = this.app.config
        const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey)
        const config = new qiniu.conf.Config()
        // @ts-ignore
        config.zone = qiniu.zone.Zone_z2
        const bucketManager = new qiniu.rs.BucketManager(mac, config)

        this.app.qiniuOss = {
            mac,
            bucketManager,
            uploadOptions: {
                accessKey: qiniuConfig.accessKey,
                secretKey: qiniuConfig.secretKey,
                bucket: qiniuConfig.bucket,
                scope: qiniuConfig.scope
                // expires: '',
                // origin: '',
                // persistentNotifyUrl: ''
            }
        }
    }

    initAliOss() {
        const { aliConfig } = this.app.config

        this.app.aliOssClient = new OSS(aliConfig)
    }
}

module.exports = AppBootHook
