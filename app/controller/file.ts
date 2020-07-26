import { Controller } from 'egg'
import moment = require('moment')
import OSS = require('ali-oss')

const client = new OSS({
  region: 'oss-cn-hangzhou',
  // 云账号 AccessKey 有所有 API 访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用 RAM 子账号或 STS，部署在客户端使用 STS。
  // accessKeyId: 'LTAIp2d1lrbhVlo6',
  // accessKeySecret: 'AnzFTZL25nddBhaJ4VqrLu9jrY5Hjk',
  accessKeyId: 'STS.NUAQb4FfGVekNKmu25nkwn1rP',
  accessKeySecret: '3Ef2C8sdhDsCiXsHBpeGauRRrF7y5fRneraDu1VqVh9D',
  bucket: 'penglai-weimall',
  secure: false // 是否使用 https
})

// import mime = require("mime")
// import uuidv4 = require("uuid/v4")
// import fs = require("fs")
// import path = require("path")
let hasDelete = false

export default class FileController extends Controller {
  prefixe: string = 'static/'

  constructor(params) {
    super(params)
  }
  

  // list(query[, options])
  // List objects in the bucket.

  // parameters:
  // [query] {Object} query parameters, default is null
  // - [prefix] {String} search object using prefix key
  // - [marker] {String} search start from marker, including marker key
  // - [delimiter] {String} delimiter search scope e.g. / only search current dir, not including subdir
  // - [max-keys] {String|Number} max objects, default is 100, limit to 1000
  // [options] {Object} optional parameters
  // - [timeout] {Number} the operation timeout

  // Success will return objects list on objects properties.
  // objects {Array} object meta info list Each ObjectMeta will contains blow properties:
  // - name {String} object name on oss
  // - lastModified {String} object last modified GMT date, e.g.: 2015-02-19T08:39:44.000Z
  // - etag {String} object etag contains ", e.g.: "5B3C1A2E053D763E1B002CC607C5A0FE"
  // - type {String} object type, e.g.: Normal
  // - size {Number} object size, e.g.: 344606
  // - storageClass {String} storage class type, e.g.: Standard
  // - owner {Object} object owner, including id and displayName
  // prefixes {Array} prefix list
  // isTruncated {Boolean} truncate or not
  // nextMarker {String} next marker string
  // res {Object} response info, including
  // - status {Number} response status
  // - headers {Object} response headers
  // - size {Number} response size
  // - rt {Number} request total use time (ms)

  /**
   * 获取文件列表
   * 文件默认目录：static
   * @param ctx
   */
  public async index (ctx) {
    try {
      let { prefixe } = ctx.request.query
      prefixe = prefixe ? `static/${prefixe}` : 'static/'

      let { objects, prefixes } = await client.list({
        prefix: prefixe,
        delimiter: '/',
        MaxKeys: 1000
      })

      if (prefixes) {
        prefixes = prefixes.map(item => item.replace(prefixe, ''))
      }
      if (objects) {
        objects = objects.filter(item => item.size).map(item => {
          delete item.etag
          delete item.storageClass
          delete item.owner
          item.url = 'https://mallcdn.youpenglai.com/' + item.name
          item.key = item.name
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


  // putStream(name, stream[, options])
  // Add a stream object to the bucket.
  
  // parameters:
  // name {String} object name store on OSS
  // stream {ReadStream} object ReadStream content instance
  // [options] {Object} optional parameters
  // - [contentLength] {Number} the stream length, chunked encoding will be used if absent
  // - [timeout] {Number} the operation timeout
  // - [mime] {String} custom mime, will send with Content-Type entity header
  // - [meta] {Object} user meta, will send with x-oss-meta- prefix string e.g.: { uid: 123, pid: 110 }
  // - [callback] {Object} The callback parameter is composed of a JSON string encoded in Base64,detail see
  //   - url {String} After a file is uploaded successfully, the OSS sends a callback request to this URL.
  //   - [host] {String} The host header value for initiating callback requests.
  //   - body {String} The value of the request body when a callback is initiated, for example, key=$(key)&etag=$(etag)&my_var=$ (x:my_var).
  //   - [contentType] {String} The Content-Type of the callback requests initiatiated, It supports application/x-www-form-urlencoded  and application/json, and the former is the default value.
  //   - [customValue] {Object} Custom parameters are a map of key-values
  //   - [headers] {Object} extra headers, detail see RFC 2616
  //   - 'Cache-Control' cache control for download, e.g.: Cache-Control: public, no-cache
  //   - 'Content-Disposition' object name for download, e.g.: Content-Disposition: somename
  //   - 'Content-Encoding' object content encoding for download, e.g.: Content-Encoding: gzip
  //   - 'Expires' expires time (milliseconds) for download, e.g.: Expires: 3600000

  // Success will return the object information.
  // object:
  // name {String} object name
  // res {Object} response info, including
  // - status {Number} response status
  // - headers {Object} response headers
  // - size {Number} response size
  // - rt {Number} request total use time (ms)

  // 上传文件
  public async create (ctx) {
    // egg-multipart，use ctx.multipart() to got file stream 解析表单数据
    const parts = ctx.multipart()
    // `static/${prefixe}`
    const dir = this.prefixe + ctx.request.query.dir


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

      const filename = part.filename
      try {
        const result = await client.putStream(dir + filename, part, { headers: { 'x-oss-forbid-overwrite': true } })
        delete result.res
        results.success.push(result)
      } catch (err) {
        part.resume() // 消耗掉文件流
        if (err.message.indexOf('already exists') > -1) {
          ctx.status = 409
        } else {
          ctx.status = 500
        }
        throw err
      }
      part = await parts()
    }
    ctx.status = 200
    return results
  }


  // get(name[, file, options])
  // Get an object from the bucket.
  
  // parameters:
  // name {String} object name store on OSS
  // [file] {String|WriteStream} file path or WriteStream instance to store the content If file is null or ignore this parameter, function will return info contains content property.
  // [options] {Object} optional parameters
  // - [versionId] {String} the version id of history object
  // - [timeout] {Number} the operation timeout
  // - [process] {String} image process params, will send with x-oss-process e.g.: {process: 'image/resize,w_200'}
  // - [headers] {Object} extra headers, detail see RFC 2616
  //   - 'Range' get specifying range bytes content, e.g.: Range: bytes=0-9
  //   - 'If-Modified-Since' object modified after this time will return 200 and object meta, otherwise return 304 not modified
  //   - 'If-Unmodified-Since' object modified before this time will return 200 and object meta, otherwise throw PreconditionFailedError
  //   - 'If-Match' object etag equal this will return 200 and object meta, otherwise throw PreconditionFailedError
  //   - 'If-None-Match' object etag not equal this will return 200 and object meta, otherwise return 304 not modified

  // Success will return the info contains response.
  // object:
  // [content] {Buffer} file content buffer if file parameter is null or ignore
  // res {Object} response info, including
  // - status {Number} response status
  // - headers {Object} response headers
  // - size {Number} response size
  // - rt {Number} request total use time (ms)



  // put(name, file[, options])
  // Add an object to the bucket.

  // parameters:
  // name {String} object name store on OSS
  // file {String|Buffer|ReadStream|File(only support Browser)|Blob(only support Browser)} object local path, content buffer or ReadStream content instance use in Node, Blob and html5 File
  // [options] {Object} optional parameters
  // - [timeout] {Number} the operation timeout
  // - [mime] {String} custom mime, will send with Content-Type entity header
  // - [meta] {Object} user meta, will send with x-oss-meta- prefix string e.g.: { uid: 123, pid: 110 }
  // - [callback] {Object} The callback parameter is composed of a JSON string encoded in Base64,detail see
  //   - url {String} After a file is uploaded successfully, the OSS sends a callback request to this URL.
  //   - [host] {String} The host header value for initiating callback requests.
  //   - body {String} The value of the request body when a callback is initiated, for example, key=$(key)&etag=$(etag)&my_var=$(x:my_var).
  //   - [contentType] {String} The Content-Type of the callback requests initiatiated, It supports application/x-www-form-urlencoded and application/json, and the former is the default value.
  //   - [customValue] {Object} Custom parameters are a map of key-values
  //   - [headers] {Object} extra headers
  //   - 'Cache-Control' cache control for download, e.g.: Cache-Control: public, no-cache
  //   - 'Content-Disposition' object name for download, e.g.: Content-Disposition: somename
  //   - 'Content-Encoding' object content encoding for download, e.g.: Content-Encoding: gzip
  //   - 'Expires' expires time (milliseconds) for download, e.g.: Expires: 3600000

  // Success will return the object information.
  // object:
  // name {String} object name
  // data {Object} callback server response data, sdk use JSON.parse() return
  // res {Object} response info, including
  // - status {Number} response status
  // - headers {Object} response headers
  // - size {Number} response size
  // - rt {Number} request total use time (ms)

  // 新建文件夹
  async createDir (ctx) {
    const dir = this.prefixe + ctx.query.path + ctx.params.dirname + '/'

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


  // delete(name[, options])
  // Delete an object from the bucket.

  // parameters:
  // name {String} object name store on OSS
  // [options] {Object} optional parameters
  // - [timeout] {Number} the operation timeout
  // - [versionId] {String} the version id of history object

  // Success will return the info contains response.
  // object:
  // res {Object} response info, including
  // - status {Number} response status
  // - headers {Object} response headers
  // - size {Number} response size
  // - rt {Number} request total use time (ms)

  // 删除文件
  public async destroy (ctx) {
    if (hasDelete) {
      ctx.status = 403
      throw new Error('删除太频繁了')
    }
    setTimeout(() => {
      hasDelete = false
    }, 10000)

    try {
      // TODO:
      const filename = ctx.params.id
      await client.delete(filename)
      ctx.status = 200
      return true
    } catch (e) {
      ctx.status = 500
      throw e
    } finally {
      hasDelete = true
    }
  }


  // getStream(name[, options])
  // Get an object read stream.
  
  // parameters:
  // name {String} object name store on OSS
  // [options] {Object} optional parameters
  // - [timeout] {Number} the operation timeout
  // - [process] {String} image process params, will send with x-oss-process
  // - [headers] {Object} extra headers
  //   - 'If-Modified-Since' object modified after this time will return 200 and object meta, otherwise return 304 not modified
  //   - 'If-Unmodified-Since' object modified before this time will return 200 and object meta, otherwise throw PreconditionFailedError
  //   - 'If-Match' object etag equal this will return 200 and object meta, otherwise throw PreconditionFailedError
  //   - 'If-None-Match' object etag not equal this will return 200 and object meta, otherwise return 304 not modified

  // Success will return the stream instance and response info.
  // object:
  // stream {ReadStream} readable stream instance if response status is not 200, stream will be null.
  // res {Object} response info, including
  // - status {Number} response status
  // - headers {Object} response headers
  // - size {Number} response size
  // - rt {Number} request total use time (ms)

  // 下载文件
  // public async download (url) {
  //   try {
  //     const result = await this.app.ossClient.getStream('object-name')
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }
}
