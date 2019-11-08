import { Service } from 'egg'
import pinyin = require('pinyin')
import { readStreamPromise } from '../../lib/utils'
export default class Icons extends Service {
  public async create (svg) {
    console.log(svg)
    const mysql = this.app.mysql
    const buffer: Buffer = await readStreamPromise(svg)
    const filename: string = svg.filename.replace('.svg', '')
    let namePingYin = pinyin(filename, {
      heteronym: false,
      segment: false,
      style: pinyin.STYLE_NORMAL
    })
      .flat(2)
      .join('')

    try {
      const checkSql = `SELECT icon_name from icons WHERE icon_name LIKE ?`
      const insertSql = 'INSERT INTO icons (id, content, icon_name, icon_desc) VALUES (REPLACE(UUID(), "-", ""), ?, ?, ?)'
      const has = await mysql.query(checkSql, [ namePingYin + '%' ])
      // 如果发现重名的图标，自动拼接序号
      if (has.length) {
        namePingYin += `-${has.length}`
      }
      const data = [
        buffer.toString('utf8'),
        namePingYin,
        filename
      ]
      const res = await mysql.query(insertSql, data)
      return res
    } catch (e) {
      throw e
    }
    // this.app.mysql.insert('icons')
  }
}
