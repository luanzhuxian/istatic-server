import { Controller } from 'egg'
// import fs = require("fs")
// import fs = require('fs')
// import path = require('path')
export default class IconsController extends Controller {
  // 获取图标
  public async index(ctx) {
    try {
      const res = await ctx.service.icons.getList(ctx.query)
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
  // 上传图标
  public async create(ctx) {
    const parts = ctx.multipart()
    const data = {
      file: null
    }
    let part = await parts()
    try {
      while (part) {
        if (part.length) {
          /**
           * 不是文件流，其它字段（非文件字段时，part是个数组）
           * 0 field, 1 value, 2 valueTruncated, 3 fieldnameTruncated
           */
          if (part[0] !== 'projectId' && part[0] !== 'id') {
            ctx.status = 403
            throw new Error('参数错误')
          }
          data[part[0]] = part[1]
        } else if (part) {
          // part 是上传的文件流
          if (!part.filename) {
            // 不包含文件
            ctx.status = 403
            throw new Error('必须包含文件')
          }
          if (part.mimeType !== 'image/svg+xml') {
            // 不是svg文件
            ctx.status = 403
            throw new Error('必须是svg文件')
          }
          data.file = part
          await ctx.service.icons.create(data)
        }
        part = await parts()
      }
      ctx.status = 200
      return data
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
