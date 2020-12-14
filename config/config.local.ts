import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
    const config = {} as PowerPartial<EggAppConfig>
    config.mysql = {
        client: {
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            password: 'lzx19870620',
            database: 'istatic',
            // 可同时执行多条语句
            multipleStatements: true
        },
        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false
    }
    config.redis = {
        client: {
            host: '127.0.0.1',
            port: 6379,
            password: '',
            db: 0
        },
        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false
    }

    config.qiniuConfig = {
        accessKey: 'Fen12idbYMTMzpPucLIbCLAIwNTXJ-rbBpB2yOVh',
        secretKey: '0DSA62PwWOQWeJ5n-qcOdUNYp5o8MCccl_ifY9PA',
        bucket: 'litemall-wx',
        publicBucketDomain: 'http://lzx.monster.red/',
        scope: 'litemall-wx',
        expires: '',
        origin: '',
        persistentNotifyUrl: ''
    }
    return config
}
