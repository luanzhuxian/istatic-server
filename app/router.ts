import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.resources('icons', '/api/icons', controller.icons)
  router.resources('icons', '/api/project', controller.project)
  router.resources('icons', '/api/link', controller.link)
}
