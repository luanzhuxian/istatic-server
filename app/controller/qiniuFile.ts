import { Controller } from 'egg'
import moment = require('moment')
// import fs = require("fs")
// import path = require("path")
// import mime = require("mime")
// import uuidv4 = require("uuid/v4")

let hasDelete = false

export default class FileController extends Controller {
    root = 'static/'
    cdn = 'cdn/'
    bucket: string
    publicBucketDomain: string
    marker = ''

    constructor(params) {
        super(params)
        this.init()
    }

    public init() {
        const { qiniuConfig } = this.app.config
        this.bucket = qiniuConfig.bucket
        this.publicBucketDomain = qiniuConfig.publicBucketDomain

        // const publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, 'so4zbehsrt8v550bczbv')
    }

    /**
     * 获取文件列表
     * 文件默认目录：static
     * @param ctx
     */
    public async index(ctx) {
        try {
            const prefix = ctx.request.query.prefix
            const { bucket, publicBucketDomain } = this
            const options = {
                prefix,
                delimiter: '/',
                limit: 999,
                marker: this.marker
            }

            const respBody = await ctx.service.qiniuFile.listPrefix(bucket, options)
            let { items = [], commonPrefixes = [], marker: nextMarker } = respBody
            // 如果 nextMarker 不为空，那么还有未列举完毕的文件列表，下次调用的时候，指定 options 里面的 marker 为这个值
            this.marker = nextMarker || ''

            commonPrefixes = commonPrefixes.map(item => {
                return item.replace(prefix, '')
            })

            if (items) {
                items = items.filter(item => item.fsize).map(item => {
                    delete item.etag
                    delete item.storageClass
                    delete item.owner
                    item.url = publicBucketDomain + item.key
                    item.key = item.key
                    item.name = item.key.split('/').splice(-1, 1).join('')
                    item.size = item.fsize
                    item.lastModified = moment(item.putTime).format('YYYY-MM-DD HH:mm:ss')
                    return item
                })
            }
            ctx.status = 200
            return {
                dir: ctx.request.query.prefix || '/',
                prefixes: commonPrefixes,
                files: items
            }
        } catch (e) {
            ctx.status = 500
            throw e
        }
    }

    // 上传文件
    public async create(ctx) {
        interface UploadResults {
            success: any[],
            failed: any[]
        }
        const uploadResults: UploadResults = {
            success: [],
            failed: []
        }

        // egg-multipart，use ctx.multipart() to got file stream 解析表单数据
        const parts = ctx.multipart()
        // `static/${prefix}`
        const dir = ctx.request.query.dir
        const uploadToken = await this.service.qiniuFile.createUploadToken()

        // part:
        // FileStream {
        //   _readableState: ReadableState {
        //     objectMode: false,
        //     highWaterMark: 16384,
        //     buffer: BufferList { head: [Object], tail: [Object], length: 1 },
        //     length: 64709,
        //     pipes: null,
        //     pipesCount: 0,
        //     flowing: null,
        //     ended: false,
        //     endEmitted: false,
        //     reading: false,
        //     sync: true,
        //     needReadable: false,
        //     emittedReadable: false,
        //     readableListening: false,
        //     resumeScheduled: false,
        //     paused: true,
        //     emitClose: true,
        //     autoDestroy: false,
        //     destroyed: false,
        //     defaultEncoding: 'utf8',
        //     awaitDrain: 0,
        //     readingMore: false,
        //     decoder: null,
        //     encoding: null
        //   },
        //   readable: true,
        //   _events: [Object: null prototype] { end: [Function] },
        //   _eventsCount: 1,
        //   _maxListeners: undefined,
        //   truncated: false,
        //   _read: [Function],
        //   fieldname: 'file0',
        //   filename: 'wwec2020.jpg',
        //   encoding: '7bit',
        //   transferEncoding: '7bit',
        //   mime: 'image/jpeg',
        //   mimeType: 'image/jpeg'
        // }

        // 每次返回一个表单的 key value，返回的是 array（非文件） 或 stream（文件）
        let part = await parts()

        while (part != null) {
            if (!part.filename) {
                return
            }

            const { filename } = part

            try {
                const isExist = await ctx.service.qiniuFile.isFileExist(this.bucket, dir + filename)
                if (isExist) {
                    throw new Error('同名文件已存在')
                }
            } catch (e) {
                if (e && e.message === '同名文件已存在') {
                    ctx.status = 409
                    throw new Error('同名文件已存在')
                }
                ctx.status = 500
                throw e
            }

            try {
                const result = await ctx.service.qiniuFile.putStream(uploadToken, dir + filename, part)
                uploadResults.success.push(result)
            } catch (err) {
                // 消耗掉文件流
                part.resume()
                ctx.status = 500
                throw err
            }

            // 继续读取下一个
            part = await parts()
        }
        ctx.status = 200
        return uploadResults
    }

    // 删除文件
    public async destroy(ctx) {
        if (hasDelete) {
            ctx.status = 403
            throw new Error('删除太频繁了')
        }
        setTimeout(() => {
            hasDelete = false
        }, 10000)

        try {
            const path = ctx.params.id
            await ctx.service.qiniuFile.delete(this.bucket, path)
            ctx.status = 200
            return true
        } catch (e) {
            ctx.status = 500
            throw e
        } finally {
            hasDelete = true
        }
    }

    // 新建文件夹
    async createDir(ctx) {
        const dir = ctx.query.path + ctx.params.dirname + '/'
        const { bucket } = this
        const options = {
            prefix: dir,
            delimiter: '/',
            limit: 1
        }

        try {
            const { items = [] } = await ctx.service.qiniuFile.listPrefix(bucket, options)
            if (items.length) {
                throw new Error('该目录已存在')
            }

            const uploadToken = await this.service.qiniuFile.createUploadToken()

            await ctx.service.qiniuFile.put(uploadToken, dir, Buffer.from(''))
            ctx.status = 200
            return 'success'
        } catch (e) {
            if (e && e.message === '该目录已存在') {
                ctx.status = 409
                throw new Error('该目录已存在')
            }
            ctx.status = 500
            throw e
        }
    }

    // 删除文件夹
    async destroyDir(ctx) {
        const { path } = ctx.params
        const { bucket } = this
        const options = {
            prefix: path,
            delimiter: '/',
            limit: 99
        }

        try {
            const { items = [] } = await ctx.service.qiniuFile.listPrefix(bucket, options)
            // if (!items.length) {
            //     throw new Error('该目录不存在或不是文件夹')
            // }
            if (items.length > 1) {
                throw new Error('该目录不为空，请先删除该目录下所有文件')
            }
            if (items.length === 1) {
                if (items[0].fsize) {
                    throw new Error('该目录不为空，请先删除该目录下所有文件')
                } else {
                    await ctx.service.qiniuFile.delete(this.bucket, path)
                    const item = items[0]
                    const dirArr = item.key.split('/')
                    const length = dirArr.length
                    item.name = dirArr[length - 1] ? dirArr[length - 1] : dirArr[length - 2]
                    ctx.status = 200
                    return item
                }
            }
        } catch (e) {
            ctx.status = 500
            throw e
        }
    }

}
