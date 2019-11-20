import { Controller } from 'egg'
// import fs = require('fs')
// import path = require('path');
export default class IconsController extends Controller {
  // 获取图标
  public async index(ctx) {
    try {
      const list = ctx.service.icons.getList(ctx.query)
      ctx.status = 200
      return list
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
  // 上传图标
  public async create(ctx) {
    let readStream
    const rule = {
      projectId: {
        type: 'string',
        require: true,
        trim: true
      },
      mimeType: 'isSvg'
    }

    try {
      readStream = await ctx.getFileStream()
      const { mimeType } = readStream
      readStream.fields.mimeType = mimeType
      ctx.validate(rule, readStream.fields)
    } catch (e) {
      ctx.status = 403
      throw e
    }

    try {
      await ctx.service.icons.create(readStream)
      ctx.status = 200
      return true
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
  // 修改图标
  public async update(ctx) {
    try {
      const res = await ctx.service.icons.update(ctx.params.id, ctx.request.body)
      ctx.status = 200
      return res[0]
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
  // 删除图标
  public async destroy (ctx) {
    try {
      await ctx.service.icons.destroy(ctx.params.id)
      ctx.status = 200
      return true
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
}
