import { Service } from 'egg'
import qiniu = require('qiniu')

export default class FileService extends Service {
    public async listPrefix (bucket, options) {
        const { bucketManager } = this.app.qiniuOss

        return new Promise((resolve, reject) => {
            try {
                // 当前路径下的文件夹 prefixes 和文件 objects
                bucketManager.listPrefix(bucket, options, (err, respBody, respInfo) => {
                    if (err) {
                        reject(err)
                    }
                    // console.log('respBody', respBody)
                    // console.log('respInfo', respInfo)
                    if (respInfo.statusCode == 200) {
                        // let { commonPrefixes = [], marker } = respBody

                        // console.log('nextMarker', marker)
                        // console.log('commonPrefixes', commonPrefixes)
                        // var items = respBody.items
                        // items.forEach(function(item) {
                        //     // console.log(item)
                        //     // console.log(item.key)
                        //     // console.log(item.hash)
                        //     // console.log(item.fsize)
                        //     // console.log(item.mimeType)
                        //     // console.log(item.putTime)
                        //     // console.log(item.type)
                        //     // console.log(item.status)
                        //     // console.log(item.md5)
                        // })
                        resolve(respBody)
                    } else {
                        console.error(respInfo.statusCode)
                        console.error(respBody.error)
                        reject(respBody)
                    }
                })
            } catch (e) {
                throw e
            }
        })
    }   

    public async stat (bucket, key) {
        const { bucketManager } = this.app.qiniuOss

        return new Promise((resolve, reject) => {
            try {
                bucketManager.stat(bucket, key, (err, respBody, respInfo) => {
                    console.log('respBody', respBody)
                    console.log('respInfo', respInfo)
                    if (err) {
                        reject(err)
                    }
                    if (respInfo.statusCode == 200) {
                        // console.log(respBody.hash)
                        // console.log(respBody.fsize)
                        // console.log(respBody.mimeType)
                        // console.log(respBody.putTime)
                        // console.log(respBody.type)
                        resolve(respBody)
                    } else {
                        console.error(respInfo.statusCode)
                        console.error(respBody.error)
                        reject(respBody)
                    }
                })
            } catch (e) {
                throw e
            }
        })
    }   

    public async isFileExist (bucket, key) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.stat(bucket, key)
                resolve(true)
            } catch (e) {
                if (e.error && e.error === 'no such file or directory') {
                    resolve(false)
                }
                reject(e)
            }
        })
    } 

    /**
     * 产生七牛的token
     */
    public async createUploadToken () {
        const { qiniuConfig } = this.app.config
        const { mac } = this.app.qiniuOss

        try {
            const putPolicy = new qiniu.rs.PutPolicy({
                scope: qiniuConfig.scope,
                expires: 7200    // 在不指定上传凭证的有效时间情况下，默认有效期为1个小时
            })
            const uploadToken = await putPolicy.uploadToken(mac)
            if (!uploadToken) {
                throw new Error('token认证失败')
            }
            return uploadToken 
        } catch (e) {
            throw e
        }
    }

    public async put (uploadToken, key, buffer) {
        const { uploadOptions } = this.app.qiniuOss
        
        const formUploader = new qiniu.form_up.FormUploader(uploadOptions)
        const putExtra = new qiniu.form_up.PutExtra()     

        return new Promise((resolve, reject) => {
            try {
                formUploader.put(uploadToken, key, buffer, putExtra, (err,
                respBody, respInfo) => {
                    if (err) {
                        reject(err)
                    }
                    if (respInfo.statusCode == 200) {
                        console.log('putStream', respBody)
                        resolve(respBody)
                    } else {
                        console.error(respInfo.statusCode)
                        console.error(respBody.error)
                        reject(respBody)
                    }
                })
            } catch (e) {
                throw e
            }
        })
    }  

    public async putStream (uploadToken, key, readableStream) {
        const { uploadOptions } = this.app.qiniuOss
        
        const formUploader = new qiniu.form_up.FormUploader(uploadOptions)
        const putExtra = new qiniu.form_up.PutExtra()     

        return new Promise((resolve, reject) => {
            try {
                formUploader.putStream(uploadToken, key, readableStream, putExtra, (err,
                respBody, respInfo) => {
                    if (err) {
                        reject(err)
                    }
                    if (respInfo.statusCode == 200) {
                        console.log('putStream success', respBody)
                        resolve(respBody)
                    } else {
                        console.error(respInfo.statusCode)
                        console.error(respBody.error)
                        reject(respBody)
                    }
                })
            } catch (e) {
                throw e
            }
        })
    }

    public async delete (bucket, key) {
        const { bucketManager } = this.app.qiniuOss

        return new Promise((resolve, reject) => {
            try {
                bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
                    if (err) {
                        reject(err)
                    }
                    if (respInfo.statusCode == 200) {
                        resolve(respBody)
                    } else {
                        console.error(respInfo.statusCode)
                        console.error(respBody.error)
                        reject(respBody)
                    }
                })
            } catch (e) {
                throw e
            }
        })
    }  
}