import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.mysql = {
    client: {
      host: '192.168.130.196',
      port: '3306',
      user: 'root',
      password: '123456',
      database: 'pl_icon'
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false
  }
  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '192.168.130.196',   // Redis host
      password: '',
      db: 0
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false
  }
  return config
}
