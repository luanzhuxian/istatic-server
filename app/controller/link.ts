import { Controller } from 'egg'

const rule = {
  projectId: {
    type: 'string',
    require: false,
    max: 32,
    min: 0
  }
}
export default class Porject extends Controller {
  public async index (ctx) {
    if (!ctx.query.projectId) {
      ctx.status = 200
      return ''
    }
    try {
      await ctx.validate(rule, ctx.query)
    } catch (e) {
      ctx.status = 403
      throw e
    }

    try {
      const res = await ctx.service.link.index(ctx.query.projectId)
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }

  public async create (ctx) {
    try {
      await ctx.validate(rule, ctx.query)
      const res = await ctx.service.link.create(ctx.query.projectId)
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
}
