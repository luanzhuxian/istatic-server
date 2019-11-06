import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  mysql: {
    enable: true,
    package: 'egg-mysql',
  }
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
}
export default plugin
