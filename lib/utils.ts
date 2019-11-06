import RStream = require("readable-stream")
/**
 * 将可读流装为promise
 * @param readStream {ReadableStream}
 * @return {Promise}
 */
export function readStreamPromise (readStream: RStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  let chunkLength: number = 0
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
