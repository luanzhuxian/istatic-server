// const proConfig = require('./config/config.prod')
// const fs = require('fs')
// const path = require('path')
class AppBootHook {
    constructor(app) {
        this.app = app;
        console.log(app.config.mysql.client)
    }

    configWillLoad(a) {
        // 此时 config 文件已经被读取并合并，但是还并未生效
        // 这是应用层修改配置的最后时机
        // 注意：此函数只支持同步调用
    }

    async didLoad() {
        // 所有的配置已经加载完毕
        // 可以用来加载应用自定义的文件，启动自定义的服务
    }

    async willReady() {
        // 所有的插件都已启动完毕，但是应用整体还未 ready
        // 可以做一些数据初始化等操作，这些操作成功才会启动应用
    }

    async didReady() {
        // 应用已经启动完毕
        this.app.validator.addRule('isSvg', (rule, value) => {
            if (value !== 'image/svg+xml') {
                return '仅支持svg文件'
            }
        })
        // if (!res.some(item => item.Tables_in_pl_icon === 'icons')) {
        //     // 数据库还未初始化
        //     let sql = fs.readFileSync(path.join(__dirname, './database/init.sql'), { encoding: 'utf8' })
        //     try {
        //         let res = await this.app.mysql.query(sql)
        //         console.log(res)
        //     } catch (e) {
        //         console.log(e)
        //     }
        // }
    }

    async serverDidReady() {
        // http / https server 已启动，开始接受外部请求
        // 此时可以从 app.server 拿到 server 的实例
    }
}

module.exports = AppBootHook;