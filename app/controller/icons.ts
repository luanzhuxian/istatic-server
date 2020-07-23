import { Controller } from 'egg'

export default class IconsController extends Controller {
  // 获取图标
  public async index(ctx) {
    // console.log('session', ctx.session)

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
    const data = {
      file: null
    }

    // egg-multipart，use ctx.multipart() to got file stream 解析表单数据
    const parts = ctx.multipart()
    // 每次返回一个表单的 key value，返回的是 array（非文件） 或 stream（文件） 
    let part = await parts()

    try {
      while (part) {
        // console.log('part', part)

        if (part.length) {
          /**
           * 不是文件流，其它字段（非文件字段时，part 是个数组）
           * part[0] field, part[1] value, part[2] valueTruncated, part[3] fieldnameTruncated
           */

          // arrays are busboy fields
          // console.log('field: ' + part[0])
          // console.log('value: ' + part[1])
          // console.log('valueTruncated: ' + part[2])
          // console.log('fieldnameTruncated: ' + part[3])

          if (part[0] !== 'projectId' && part[0] !== 'id') {
            ctx.status = 422
            throw new Error('参数错误')
          }
          data[part[0]] = part[1]
        // } else if (part) {
        } else {
          // part 是上传的文件流

          // otherwise, it's a stream
          // console.log('field: ' + part.fieldname)
          // console.log('filename: ' + part.filename)
          // console.log('encoding: ' + part.encoding)
          // console.log('mime: ' + part.mime)

          if (!part.filename) {
            // 不包含文件
            ctx.status = 422
            throw new Error('必须包含文件')
          }

          if (part.mimeType !== 'image/svg+xml') {
            // 不是svg文件
            ctx.status = 422
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
