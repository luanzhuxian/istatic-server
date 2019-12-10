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
  }
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
}
export default plugin
