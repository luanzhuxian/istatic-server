import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.resources('icons', '/api/icons', controller.icons)
  router.resources('project', '/api/project', controller.project)
  router.resources('link', '/api/link', controller.link)
  router.resources('file', '/api/file', controller.file)
  // router.resources('download_file', '/api/file/download', controller.download)
}
