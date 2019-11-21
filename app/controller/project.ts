import { Controller } from 'egg'

export default class Porject extends Controller {
  public async index (ctx) {
    try {
      const res = await ctx.service.project.getList()
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }

  public async create (ctx) {
    const rule = {
      name: {
        type: 'string',
        max: 10,
        require: true
      }
    }
    const body: ProjectData = ctx.request.body

    try {
      ctx.validate(rule, body)
    } catch (e) {
      ctx.status = 403
      throw e
    }

    try {
      const res = await ctx.service.project.create(body)
      ctx.status = 200
      return res
    } catch (e) {
      throw e
    }
  }

  public async update (ctx) {
    const rule = {
      name: {
        type: 'string',
        max: 10,
        require: true
      },
      id: {
        type: 'string',
        max: 32,
        require: true
      }
    }
    const body: ProjectData = ctx.request.body
    body.id = ctx.params.id

    try {
      ctx.validate(rule, body)
    } catch (e) {
      ctx.status = 403
      throw e
    }

    try {
      const res = await ctx.service.project.update(body)
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }

  public async destroy (ctx) {
    const rule = {
      id: {
        type: 'string',
        max: 32,
        require: true
      }
    }

    try {
      ctx.validate(rule, ctx.params)
    } catch (e) {
      ctx.status = 403
      throw e
    }

    try {
      await ctx.service.project.destroy(ctx.params.id)
      ctx.status = 200
      return true
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
}
