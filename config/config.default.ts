import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config = {
    security: {
      csrf: false
        // csrf: {
        // useSession: true, // 默认为 false，当设置为 true 时，将会把 csrf token 保存到 Session 中(通过ctx.session.csrfToken获取)
        // cookieName: 'token', // Cookie 中的字段名，默认为 csrfToken
        // sessionName: 'token', // Session 中的字段名，默认为 csrfToken
        // headerName: 'token', // Session 中的字段名，默认为 csrfToken
        // queryName: 'csrfToken', // 通过 query 传递 CSRF token 的默认字段为 csrfToken
        // bodyName: 'csrfToken', // 通过 body 传递 CSRF token 的默认字段为 csrfToken
        // }
    },
    // 默认值为 SAMEORIGIN，只允许同域页面作为 iframe 嵌入，防止 iframe 钓鱼
    xframe: {
      enable: false,
    },
    bodyParser: {
      jsonLimit: '5mb',
      formLimit: '5mb'
    },
    multipart: {
      mode: 'stream',
      fields: 1000,
      files: 1000
    },
    middleware: [
      'errorHandler',
      'notFoundHandler',
      'responseSuccess'
    ],
    errorHandler: {
      match: '/api',
    },
    /**
     * session相关配置，这里配置的是默认值，可以通过ctx.session[pro]进行动态设置
     * 可以通过ctx.session[key] = value 给session添加额外的值，这个值会被egg-session-redis放入redis中
     * egg会自动生成session并设置到cookie中，并在请求的时候，根据 cookie中的session key(session_id) 自动获取到设置的 session，并放在 ctx.session 中,
     */
    session: {
      key: 'session_id', // session的key
      maxAge: 24 * 3600 * 1000 * 30, // 30 天
      httpOnly: true,
      encrypt: true,
      renew: true // 在发现当用户 Session 的有效期仅剩下最大有效期一半的时候，重置 Session 的有效期, 前提是用户正在访问
    },
    passportLocal: {
      // 用户名密码的字段
      // Both fields define the name of the properties in the POST body that are sent to the server.
      usernameField: 'account',
      passwordField: 'password'
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
    ...bizConfig
  }
}
