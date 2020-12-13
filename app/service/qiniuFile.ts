import { Service } from 'egg'

export default class FileService extends Service {
    public async index(bucket, options, bucketManager) {
        try {
            return new Promise((resolve) => {
                    
                // 当前路径下的文件夹 prefixes 和文件 objects
                bucketManager.listPrefix(bucket, options, (err, respBody, respInfo) => {
                    if (err) {
                        console.error(err)
                        throw err
                    }
                    console.log('respBody', respBody)
                    // console.log('respInfo', respInfo)
                    if (respInfo.statusCode == 200) {
                        let { commonPrefixes = [], marker } = respBody

                        console.log('nextMarker', marker)
                        console.log('commonPrefixes', commonPrefixes)
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
                        console.log(respInfo.statusCode)
                        console.log(respBody)
                    }
                })
            })
        } catch (e) {
            throw e
        }
    }   
}