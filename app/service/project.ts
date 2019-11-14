import { Service } from 'egg'
import moment = require("moment")
export default class Icons extends Service {
  public async getList () {
    const SQL = `SELECT * FROM project`
    return this.app.mysql.query(SQL)
  }

  public async create (data: ProjectData) {
    try {
      const mysql = this.app.mysql
      const SQL = `INSERT INTO project (id, project_name) VALUES (REPLACE(UUID(), "-", ""),?)`
      const res = await mysql.query(SQL, [ data.name ])
      return res
    } catch (e) {
      throw e
    }
  }

  public async update (data: ProjectData) {
    try {
      const mysql = this.app.mysql
      const SQL = `UPDATE project SET project_name=?, update_time=? WHERE id=?`
      const updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
      const res = await mysql.query(SQL, [
        data.name,
        updateTime,
        data.id
      ])
      return res
    } catch (e) {
      throw e
    }
  }
}
