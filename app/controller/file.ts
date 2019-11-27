import { Controller } from 'egg'
import moment = require("moment")

export default class FileController extends Controller {
  /**
   * 获取文件列表
   * 文件默认目录：static
   * @param ctx
   */
  public async index (ctx) {
    try {
      let prefixe = ctx.request.query.prefixe
      prefixe = prefixe ? `static/${prefixe}` : 'static/'
      console.log(prefixe)
      const client = this.app.ossClient
      const result = await client.list({
        prefix: prefixe,
        delimiter: '/',
        MaxKeys: 1000
      })
      let { objects, prefixes } = result
      if (prefixes) {
        prefixes = prefixes.map(item => {
          return item.replace(prefixe, '')
        })
      }
      if (objects) {
        objects = objects.filter(item => item.size).map(item => {
          delete item.etag
          delete item.storageClass
          delete item.owner
          item.url = 'https://mallcdn.youpenglai.com/' + item.name
          item.name = item.name.split('/').splice(-1, 1).join('')
          item.lastModified = moment(item.lastModified).format('YYYY-MM-DD HH:mm:ss')
          return item
        })
        // 如果当前目录下存在目录，objects下的第一条数据是这些目录的总大小，应删掉
        if (prefixes) {
          // objects.splice(0, 1)
        }
      }
      ctx.status = 200
      return {
        dir: ctx.request.query.prefixe || '/',
        prefixes: prefixes || [],
        files: objects || []
      }
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }
  // 上传文件
  public async create (ctx) {
    console.log(ctx)
  }
  // 下载文件
  // public async download (url) {
  //   try {
  //     const result = await this.app.ossClient.getStream('object-name')
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }
}
