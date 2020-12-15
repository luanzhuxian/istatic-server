import { Service } from 'egg'
import moment = require('moment')
import uuidv1 = require('uuid/v1')

export default class PorjectService extends Service {
    public async getList () {
        const SQL = `
                        SELECT *,
                        DATE_FORMAT(create_time, '%Y-%m-%d %T') as create_time,
                        DATE_FORMAT(update_time, '%Y-%m-%d %T') as update_time
                        FROM project
                        order by 'update_time' desc
                    `

        const res = await this.app.mysql.query(SQL)
        res.map(item => {
            item.name = item.project_name
            item.disabled = Boolean(item.disabled)
            delete item.project_name
        })
        return res
    }

    public async create (data: ProjectData) {
        try {
            const { mysql } = this.app
            const id = uuidv1().replace(/\-/g, '')
            const SQL = 'INSERT INTO project (id, project_name) VALUES (?,?)'
            const selectSql = `SELECT * FROM project WHERE id='${id}'`

            const res: {
                fieldCount: number;
                affectedRows: number;
                changedRows: number;
                insertId: number;
                serverStatus: number;
                warningCount: number;
                message: string;
                protocol41: boolean;
            } = await mysql.query(SQL, [ id, data.name ])
            if (res.affectedRows >= 1) {
                const [ current ] = await mysql.query(selectSql)
                return current
            }
            return null
        } catch (e) {
            throw e
        }
    }

    public async update (data: ProjectData) {
        if (data.id === 'has_removed') {
            this.ctx.status = 403
            throw new Error('不可编辑')
        }

        try {
            const { mysql } = this.app
            const { id, name, fontFace } = data
            const updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
            const SQL = `UPDATE project SET project_name=?, update_time=?, font_face=? WHERE id=?`
            const selectSql = `
                                SELECT *,
                                project_name as name,
                                DATE_FORMAT(create_time, '%Y-%m-%d %T') as create_time,
                                DATE_FORMAT(update_time, '%Y-%m-%d %T') as update_time
                                FROM project WHERE id='${id}'
                              `

            const res = await mysql.query(SQL, [ name, updateTime, fontFace, id])
            if (res.affectedRows >= 1) {
                const [ current ] = await mysql.query(selectSql)
                current.disabled = Boolean(current.disabled)
                delete current.project_name
                return current
            }
            return null
        } catch (e) {
            throw e
        }
    }

    public async destroy (id) {
        if (id === 'has_removed') {
            this.ctx.status = 403
            throw new Error('不可删除')
        }
        
        try {
            return Promise.all([
                this.app.mysql.query('DELETE FROM project WHERE id = ?', [ id ]),
                this.app.mysql.query('UPDATE icons SET project_id = \'has_removed\' WHERE project_id = ?', [ id ])
            ])
        } catch (e) {
            throw e
        }
    }
}
