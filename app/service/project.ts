import { Service } from 'egg'
import moment = require("moment")
import uuidv1 = require('uuid/v1')
export default class Icons extends Service {
  public async getList () {
    const SQL = `SELECT *,DATE_FORMAT(create_time, '%Y-%m-%d %T') as create_time, DATE_FORMAT(update_time, '%Y-%m-%d %T') as update_time FROM project`
    let res = await this.app.mysql.query(SQL)
    res.map(item => {
      item.name = item.project_name
      delete item.project_name
    })
    return res
  }

  public async create (data: ProjectData) {
    try {
      const mysql = this.app.mysql
      const id = uuidv1().replace(/\-/g, '')
      const SQL = `INSERT INTO project (id, project_name) VALUES (?,?)`
      const selectSql = `SELECT * FROM project WHERE id='${id}'`
      const res = await mysql.query(SQL, [ id, data.name ])
      if (res.affectedRows >= 1) {
        const current = await mysql.query(selectSql)
        return current[0]
      }
      return null
    } catch (e) {
      throw e
    }
  }

  public async update (data: ProjectData) {
    try {
      const mysql = this.app.mysql
      const SQL = `UPDATE project SET project_name=?, update_time=? WHERE id=?`
      const selectSql = `SELECT * FROM project WHERE id='${data.id}'`
      const updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
      const res = await mysql.query(SQL, [
        data.name,
        updateTime,
        data.id
      ])
      if (res.affectedRows >= 1) {
        const current = await mysql.query(selectSql)
        return current[0]
      }
      return null
    } catch (e) {
      throw e
    }
  }

  public async destroy (id) {
    try {
      return this.app.mysql.query('DELETE FROM project WHERE id = ?', [ id ])
    } catch (e) {
      throw e
    }
  }
}
