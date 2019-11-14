import { Controller } from 'egg'

export default class Porject extends Controller {
  public async index (ctx) {
    try {
      ctx.service.link.index()
    } catch (e) {
      throw e
    }
  }
}
