import { Service } from 'egg'
import uuidv1 = require('uuid/v1')
import pinyin = require('pinyin')
import { readStreamPromise } from '../../lib/utils'
export default class Icons extends Service {
  public async create (svg) {
    const buffer: Buffer = await readStreamPromise(svg)
    const filename: string = svg.filename.replace('.svg', '')
    const namePingYin: string[][] = pinyin(filename, {
      heteronym: false,
      segment: false,
      style: pinyin.STYLE_NORMAL
    })
      .flat(2)
      .join('')
    const data = {
      id: uuidv1(),
      content: buffer.toString('utf8'),
      icon_name: namePingYin,
      icon_desc: filename
    }
    const checkSql = `select icon_name from icons where icon_name like '${namePingYin}'`
    console.log(checkSql)
    const res = await this.app.mysql.query(checkSql)
    console.log(res)
    console.log(data)
    // this.app.mysql.insert('icons')
  }
}
