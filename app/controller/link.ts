import { Controller } from 'egg'

export default class Porject extends Controller {
  public async index (ctx) {
    try {
      const res = await ctx.service.link.index()
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }

  public async create (ctx) {
    try {
      const res = await ctx.service.link.create()
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
}
