import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.resources('icons', '/api/icons', controller.icons)
}
