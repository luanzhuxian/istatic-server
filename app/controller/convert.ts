import { Controller } from 'egg'
import fs = require('fs')
import path = require('path')

// import mime = require("mime")
// import uuidv4 = require("uuid/v4")

export default class ConvertController extends Controller {
  public async index (ctx) {
    try {
      const res = await ctx.service.convert.index()
      ctx.status = 200
      return res
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }

  // 上传文件
  public async create (ctx) {
    const parts = ctx.multipart()
    // 每次返回一个表单的 key value，返回的是 array（非文件） 或 stream（文件） 
    let part = await parts()

    interface Results {
      success: any[],
      failing: any[]
    }
    const results: Results = {
      success: [],
      failing: []
    }
    
    try {
      while (part) {
        if (part.length) {
        // 不是文件流

        } else {
          if (!part.filename) {
            ctx.status = 422
            throw new Error('必须包含文件')
          }
  
          // const { filename } = part
          const result = await ctx.service.convert.create(part, 'base64')
          results.success.push(result)
        }
        
        part = await parts()
      }

      ctx.status = 200
      return results
    } catch (err) {
      part.resume() // 消耗掉文件流
      if (err.message.indexOf('already exists') > -1) {
        ctx.status = 409
      } else {
        ctx.status = 500
      }
      throw err
    }
  }

  // 删除文件
  // public async destroy (ctx) {
  //   try {
  //     // TODO:
  //     const filename = ctx.params.id
  //     await client.delete(filename)
  //     ctx.status = 200
  //     return true
  //   } catch (e) {
  //     ctx.status = 500
  //     throw e
  //   }
  // }

  public async save (ctx) {
    const rule = {
      name: {
        type: 'string',
        require: true,
        max: 100,
        min: 0
      },
      content: {
        type: 'string',
        require: true,
        min: 0
      }
    }

    try {
      await ctx.validate(rule, ctx.request.body)
    } catch (e) {
      ctx.status = 422
      throw e
    }

    const { name, content } = ctx.request.body
    const base64Data = content.replace(/^data:image\/\w+;base64,/, '')
    const base64Buffer = new Buffer(base64Data, 'base64')

    const appDir = path.resolve(__dirname, '../')
    const publicDir = path.resolve(appDir, 'public')
    const filePath = path.resolve(publicDir, name)

    const writeFile = (path, data) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
          if (err) {
            reject(err)
          }
          resolve(true)
        })
      })
    }

    if (fs.existsSync(publicDir)) {
      // const stat = fs.statSync(filePath)
      if (fs.existsSync(filePath)) {
        ctx.status = 409
        throw new Error('图片已经存在')
      }
      
      try {
        await writeFile(filePath, base64Buffer)
        ctx.status = 200
        return true
      } catch (error) {
        ctx.status = 500
        throw error
      }
    } else {
      try {
          fs.mkdirSync(publicDir)
          await writeFile(filePath, base64Buffer)
          ctx.status = 200
          return true
        } catch (error) {
          ctx.status = 500
          throw error
        }
    }
  }
}
