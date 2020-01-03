import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.resources('icons', '/api/icons', controller.icons)
  router.resources('project', '/api/project', controller.project)
  router.resources('link', '/api/link', controller.link)
  router.resources('file', '/api/file', controller.file)
  router.post('/api/create/dir/:dirname', controller.file.createDir)

  router.resources('user', '/api/user', controller.user)
  router.post('/api/user/login', app.passport.authenticate('local', {
    successRedirect: '/api/user?pass=1',
    failureRedirect: '/api/user?pass=2'
  }))
  // router.resources('download_file', '/api/file/download', controller.download)
}
