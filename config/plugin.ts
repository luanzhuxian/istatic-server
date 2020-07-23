import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  validate: {
    enable: true,
    package: 'egg-validate'
  },
  redis: {
    enable: true,
    package: 'egg-redis'
  },
  sessionRedis: {
    enable: true,
    package: 'egg-session-redis',
  },

  // 鉴权差距
  passport: {
    enable: true,
    package: 'egg-passport',
  },
  // 采用用户名 + 密码鉴权模式（Strategy）
  passportLocal: {
    enable: true,
    package: 'egg-passport-local'
  }
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
}
export default plugin
