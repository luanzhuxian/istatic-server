import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.resources('project', '/api/project', controller.project)
  router.resources('link', '/api/link', controller.link)
  router.resources('icons', '/api/icons', controller.icons)
  router.resources('file', '/api/file', controller.file)
  router.resources('user', '/api/user', controller.user)
  router.post('/api/create/dir/:dirname', controller.file.createDir)

  // app.passport.authenticate(strategy, options) - 生成指定的鉴权中间件
  //   options.successRedirect - 指定鉴权成功后的 redirect 地址
  //   options.loginURL - 跳转登录地址，默认为 /passport/${strategy}
  //   options.callbackURL - 授权后回调地址，默认为 /passport/${strategy}/callback
  router.post('/api/user/login', app.passport.authenticate('local', {
    successRedirect: '/api/user?pass=1',
    failureRedirect: '/api/user?pass=2'
  }))

  router.resources('convert', '/api/convert', controller.convert)
  router.post('/api/convert/save/:id', controller.convert.save)
}
