import RStream = require('readable-stream')
import uuidv4 = require('uuid/v4')

/**
 * 将可读流装为 promise
 * @param readStream {ReadableStream}
 * @return {Promise}
 */
export function readStreamPromise(readStream: RStream): Promise<Buffer> {
    const chunks: Buffer[] = []
    let chunkLength = 0

    return new Promise((resolve, reject) => {
        readStream.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
            chunkLength += chunk.length
        })
        readStream.on('end', () => {
            resolve(Buffer.concat(chunks, chunkLength))
        })
        readStream.on('error', e => {
            reject(e)
        })
    })
}

export function uuidv4() {
    return uuidv4().replace(/\-/g, '').replace(/\d/g, '')
}
