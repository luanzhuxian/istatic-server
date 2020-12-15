import { Controller } from 'egg'

export default class IconsController extends Controller {
    // 获取图标
    public async index (ctx) {
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
    public async create (ctx) {
        const data = {
            file: null
        }

        // egg-multipart，use ctx.multipart() to got file stream 解析表单数据，表单包含：
        // data: {
        //     file,    // 上传的文件流
        //     id,
        //     projectId,
        //     namespace
        // } 
        const parts = ctx.multipart()
        // 每次返回一个表单的 key value，返回的是 array（非文件） 或 stream（文件）
        let part = await parts()

        try {
            while (part) {
                if (part.length) {
                    /**
                     * 不是文件流，是其它字段（非文件字段时，part 是个数组）
                     * part[0] field, 
                     * part[1] value, 
                     * part[2] valueTruncated, 
                     * part[3] fieldnameTruncated
                     */

                    // arrays are busboy fields
                    // console.log('field: ' + part[0])
                    // console.log('value: ' + part[1])
                    // console.log('valueTruncated: ' + part[2])
                    // console.log('fieldnameTruncated: ' + part[3])
                    
                    // @exmaple
                    // [ 'projectId', '08d9ff203e8c11ebab8b991ed7355826', false, false]   
                    // [ 'id', '', false, false ]   

                    const [ field, value ] = part

                    if (field !== 'projectId' && field !== 'id' && field !== 'namespace') {
                        ctx.status = 422
                        throw new Error('参数错误')
                    }

                    data[field] = value
                } else {
                    // 是上传的文件流

                    // otherwise, it's a stream
                    // console.log('field: ' + part.field)
                    // console.log('filename: ' + part.filename)
                    // console.log('encoding: ' + part.encoding)
                    // console.log('mime: ' + part.mime)

                    // @exmaple
                    // FileStream {
                    //     _readableState: ReadableState {
                    //       objectMode: false,
                    //       highWaterMark: 16384,
                    //       buffer: BufferList { head: [Object], tail: [Object], length: 1 },
                    //       length: 601,
                    //       pipes: null,
                    //       pipesCount: 0,
                    //       flowing: null,
                    //       ended: true,
                    //       endEmitted: false,
                    //       reading: false,
                    //       sync: false,
                    //       needReadable: false,
                    //       emittedReadable: false,
                    //       readableListening: false,
                    //       resumeScheduled: false,
                    //       paused: true,
                    //       emitClose: true,
                    //       autoDestroy: false,
                    //       destroyed: false,
                    //       defaultEncoding: 'utf8',
                    //       awaitDrain: 0,
                    //       readingMore: false,
                    //       decoder: null,
                    //       encoding: null
                    //     },
                    //     readable: true,
                    //     _events: [Object: null prototype] { end: [Function] },
                    //     _eventsCount: 1,
                    //     _maxListeners: undefined,
                    //     truncated: false,
                    //     _read: [Function],
                    //     fieldname: 'file0',
                    //     filename: 'male.svg',
                    //     encoding: '7bit',
                    //     transferEncoding: '7bit',
                    //     mime: 'image/svg+xml',
                    //     mimeType: 'image/svg+xml'
                    // }
                      
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

                    // 上传的文件流
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
    public async update (ctx) {
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

    async demo (ctx) {
        const res = await ctx.service.icons.demo()
        ctx.status = 200
        return res
    }
}
