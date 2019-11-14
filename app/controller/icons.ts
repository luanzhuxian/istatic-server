import { Controller } from 'egg'
// import fs = require('fs')
// import path = require('path');
export default class IconsController extends Controller {
  public async index(ctx) {
    try {
      const list = ctx.service.icons.getList()
      ctx.status = 200
      return list
    } catch (e) {
      ctx.status = 500
      throw e
    }
  }

  public async create(ctx) {
    try {
      const readStream = await ctx.getFileStream()
      const {
        mimeType
      } = readStream
      if (mimeType !== 'image/svg+xml') {
        ctx.status = 403
        throw new Error('仅支持svg文件')
      }
      await ctx.service.icons.create(readStream)
      ctx.status = 200
      return true
    } catch (e) {
      ctx.status = 500
      throw e
    }
    // const chunks: Buffer[] = []
    // let chunksLength = 0
    // readStream.on('data', chunk => {
    //   chunks.push(chunk)
    //   console.log(chunk)
    //   chunksLength += chunk.length
    // })
    // readStream.on('end', () => {
    //   console.log('end')
    //   const buf: Buffer = Buffer.concat(chunks, chunksLength)
    //   buf.toString('utf8')
    //   ctx.service.icons.create()
    //   ctx.status = 200
    // })
  }

  public async update(ctx) {
    console.log(ctx.params.id)
    console.log('update')
    ctx.body = 'update'
  }
}