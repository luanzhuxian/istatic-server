import { Controller } from 'egg'

export default class LinkController extends Controller {
    public async index(ctx) {
        const rule = {
            projectId: {
                type: 'string',
                require: false,
                max: 32,
                min: 0
            }
        }

        // 没有 project 的时候 projectId 可能为空
        if (!ctx.query.projectId) {
            ctx.status = 200
            return {
                id: '',
                link: '',
                create_time: ''
            }
        }

        try {
            await ctx.validate(rule, ctx.query)
        } catch (e) {
            ctx.status = 422
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

    public async create(ctx) {
        const rule = {
            projectId: {
                type: 'string',
                require: true,
                max: 32,
                min: 0
            }
        }

        try {
            await ctx.validate(rule, ctx.query)
        } catch (e) {
            ctx.status = 422
            throw e
        }

        try {
            const res = await ctx.service.link.create(ctx.query.projectId)
            ctx.status = 200
            return res
        } catch (e) {
            ctx.status = 500
            throw e
        }
    }

    public async download (ctx) {
        try {
          await ctx.service.link.download(ctx.request.body.dirKey)
          ctx.status = 200
          return
        } catch (e) {
          ctx.status = 500
          throw e
        }
    }
}
