import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config = {} as PowerPartial<EggAppConfig>
  config.mysql = {
    client: {
    host: 'localhost',
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
  return config
}
