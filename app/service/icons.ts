import { Service } from 'egg'
import pinyin = require('pinyin')
import { readStreamPromise } from '../../lib/utils'
export default class Icons extends Service {
  public async getList (projectId) {
    const SQL = `SELECT * FROM icons WHERE project_id = ? AND visible = 1`
    return this.app.mysql.query(SQL, projectId)
  }
  public async create (svg) {
    const fields: IconsFields = svg.fields
    const mysql = this.app.mysql
    const buffer: Buffer = await readStreamPromise(svg)
    const filename: string = svg.filename.replace('.svg', '')
    // 如果文件名是中文的，转成拼音
    let namePingYin = pinyin(filename, {
      heteronym: false,
      segment: false,
      style: pinyin.STYLE_NORMAL
    }).toString().split(',').join('')
    try {
      const checkSql = `SELECT icon_name from icons WHERE icon_name LIKE ?`
      const insertSql = 'INSERT INTO icons (id, content, icon_name, icon_desc, project_id, namespace) VALUES (REPLACE(UUID(), "-", ""), ?, ?, ?, ?, ?)'
      const has = await mysql.query(checkSql, [ 'pl-' + namePingYin + '%' ])
      // 如果发现重名的图标，自动拼接序号
      if (has.length) {
        namePingYin += `-${has.length}`
      }
      namePingYin = 'pl-' + namePingYin
      const data = [
        buffer.toString('utf8'),
        namePingYin,
        filename,
        fields.project_id,
        fields.namespace || null
      ]
      const res = await mysql.query(insertSql, data)
      return res
    } catch (e) {
      throw e
    }
  }
  destroy (id) {
    const sql = `UPDATE icons SET visible = 0 WHERE id = ?`
    return this.app.mysql.query(sql, [ id ])
  }
}
