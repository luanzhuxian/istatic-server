import { Service } from 'egg'

export default class ConvertService extends Service {
    public async index () {
        const SQL = `
            SELECT *,
            image_name as name,
            DATE_FORMAT(create_time, '%Y-%m-%d %T') as createTime,
            DATE_FORMAT(update_time, '%Y-%m-%d %T') as updateTime
            FROM images
            order by 'update_time' desc
        `
        try {
            const res = await this.app.mysql.query(SQL)
            return res
        } catch (error) {
            throw error
        }
    }

    public async create (file, encoding: string = 'base64') {
        try {
            const { filename, mime } = file
            const selectSQL = `SELECT * FROM images WHERE image_name = ?`
            const insertSQL = 'INSERT INTO images (id, image_name, content) VALUES (REPLACE(UUID(), "-", ""), ?, ?)'

            const selectList = await this.app.mysql.query(selectSQL, [ filename ])
            if (selectList.length) {
                throw new Error('file already exists') 
            }

            return new Promise((resolve, reject) => {
                // file.on('readable', async () => {
                //     const data = file.read()
                //     if (data) {
                //         const base64Img = `data:${mime};base64,${data.toString(encoding)}`
        
                //         try {
                //             const result = await this.app.mysql.query(insertSQL, [ filename, base64Img ])
                //             if (result.affectedRows) {
                //                 const [current] = await this.app.mysql.query(selectSQL, [ filename ])
                //                 current.name = current.image_name
                //                 resolve(current)
                //             }
                //         } catch (error) {
                //             reject(error)
                //         }
                //     }
                // })

                const chunks = [] as Array<Buffer> // 用于保存网络请求不断加载传输的缓冲数据
                let size = 0

                // 在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，node 会把接收到的数据片段逐段的保存在缓冲区（Buffer），这些数据片段会形成一个个缓冲对象（即 Buffer 对象），而 Buffer 数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到 chunks 数组中，利用下面的 node.js 内置的 Buffer.concat() 方法进行拼接，将 chunks 数组中的缓冲数据拼接起来，返回一个新的 Buffer 对象
                file.on('data', chunk => {
            　　　　chunks.push(chunk)　 
            　　　　size += chunk.length
            　　})

                file.on('end', async err => {
                    if (err) {
                        console.warn('*********** err ************', err)
                    }

            　　　　const data = Buffer.concat(chunks, size)
            　　　　const base64Img = `data:${mime};base64,${data.toString(encoding)}`

                    try {
                        const result = await this.app.mysql.query(insertSQL, [ filename, base64Img ])
                        if (result.affectedRows) {
                            const [current] = await this.app.mysql.query(selectSQL, [ filename ])
                            current.name = current.image_name
                            resolve(current)
                        }
                    } catch (error) {
                        reject(error)
                    }
            　　})
            })

        } catch (error) {
            console.warn('*********** error ************', error)
            throw error
        }
    }

    public async delete (id) {
        const SQL = 'DELETE FROM images WHERE id = ?'

        try {
            const res = await this.app.mysql.query(SQL, [ id ])
            if (res.affectedRows) {
                return true
            }
            return null
        } catch (error) {
            throw error
        }
    }

    public async find (id) {
        const SQL = `
            SELECT *,
            image_name as name,
            DATE_FORMAT(create_time, '%Y-%m-%d %T') as createTime,
            DATE_FORMAT(update_time, '%Y-%m-%d %T') as updateTime
            FROM images WHERE id = ?
        `
        try {
            const [current] = await this.app.mysql.query(SQL, [ id ])
            return current
        } catch (error) {
            throw error
        }
    }
}
