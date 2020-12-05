const OSS = require('ali-oss')
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
        this.app.ossClient = new OSS({
            region: 'oss-cn-hangzhou',
            // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
            // accessKeyId: 'L---TAI4GGpjwn2daaWfD2tdZU9',
            // accessKeySecret: '3---GBPL5eBs4sGCnpEJB8vZKlieemDdI',
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

module.exports = AppBootHook
