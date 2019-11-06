import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config = {
    security: {
      csrf: {
        enable: false,
      },
    },
    bodyParser: {
      jsonLimit: '1mb',
      formLimit: '1mb'
    },
    multipart: {
      fileSize: '50mb',
      mode: 'stream'
    },
    middleware: [
      'errorHandler',
      'notFoundHandler',
      'responseSuccess'
    ],
    errorHandler: {
      match: '/api',
    },
    xframe: {
      enable: false,
    }
  } as PowerPartial<EggAppConfig>

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1572252687052_1311'

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  }

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  }
}
