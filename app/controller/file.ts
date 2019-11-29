import { Controller } from 'egg'
import moment = require("moment")
import mime = require("mime")
import uuidv4 = require("uuid/v4")
import fs = require("fs")
import path = require("path")

export default class FileController extends Controller {
  prefixe: string = 'static/'
  /**
   * 获取文件列表
   * 文件默认目录：static
   * @param ctx
   */
  public async index (ctx) {
    try {
      let prefixe = ctx.request.query.prefixe
      prefixe = prefixe ? `static/${prefixe}` : 'static/'
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
    const parts = ctx.multipart()
    const dir = this.prefixe + ctx.request.query.dir
    let part = await parts()
    interface Results {
      success: any[],
      failing: any[]
    }
    const results: Results = {
      success: [],
      failing: []
    }
    while (part != null) {
      if (!part.filename) {
        return
      }
      const filename = uuidv4()
      const ext = mime.getExtension(part.mimeType)
      console.log(dir + filename + '.' + ext)
      try {
        const result = await this.app.ossClient.putStream(dir + filename + '.' + ext, part)
        delete result.res
        results.success.push(result)
      } catch (err) {
        part.pipe(fs.createWriteStream(path.join(__dirname, `../../temp/${filename}.${ext}`)))
        results.failing.push({
          message: err.message,
          file: part.filename
        })
      }
      part = await parts()
    }
    ctx.status = 200
    return results
  }
  // 新建文件夹
  async createDir (ctx) {
    const dir = this.prefixe + ctx.params.dirname + '/'
    const client = this.app.ossClient
    console.log(dir)
    try {
      const { res: exist } = await client.get(dir)
      if (exist.status === 200) {
        throw new Error('该目录已存在')
      }
    } catch (e) {
      if (e.message === '该目录已存在') {
        ctx.status = 500
        throw new Error('该目录已存在')
      }
      try {
        const { res: info } = await client.put(dir, Buffer.from(''))
        ctx.status = 200
        return info
      } catch (err) {
        ctx.status = 500
        throw err
      }
    }
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
