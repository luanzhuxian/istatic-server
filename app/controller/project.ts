import { Controller } from 'egg'

export default class PorjectController extends Controller {
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
            ctx.status = 422
            throw e
        }

        try {
            const res = await ctx.service.project.create(body)
            ctx.status = 200
            return res
        } catch (e) {
            ctx.status = 500
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
            },
            fontFace: {
                type: 'string',
                max: 32,
                require: false
            }
        }
        const body: ProjectData = ctx.request.body
        body.id = ctx.params.id

        try {
            ctx.validate(rule, body)
        } catch (e) {
            ctx.status = 422
            throw e
        }

        if (body.id === 'has_removed') {
            ctx.status = 403
            throw new Error('不可编辑')
        }

        try {
            const res = await ctx.service.project.update(body)
            ctx.status = 200
            return res
        } catch (e) {
            ctx.status = ctx.status || 500
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
            ctx.status = 422
            throw e
        }

        if (ctx.params.id === 'has_removed') {
            this.ctx.status = 403
            throw new Error('不可删除')
        }

        try {
            await ctx.service.project.destroy(ctx.params.id)
            ctx.status = 200
            return true
        } catch (e) {
            ctx.status = ctx.status || 500
            throw e
        }
    }
}
