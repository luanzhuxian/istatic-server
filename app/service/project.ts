import { Service } from 'egg'
import moment = require('moment')
import uuidv1 = require('uuid/v1')

export default class PorjectService extends Service {
    public async getList() {
        const SQL = `
                        SELECT *,
                        DATE_FORMAT(create_time, '%Y-%m-%d %T') as create_time,
                        DATE_FORMAT(update_time, '%Y-%m-%d %T') as update_time
                        FROM project
                        order by 'update_time' desc
                    `

        // res: Array< RowDataPacket >
        // [
        //   RowDataPacket {
        //     id: '76d10410c4ac11ea93872329f8a316d4',
        //     project_name: 'haha',
        //     create_time: '2020-07-13 09:59:19',
        //     update_time: '2020-07-13 09:59:23'
        //   }
        // ]
        const res = await this.app.mysql.query(SQL)
        res.map(item => {
            item.name = item.project_name
            item.disabled = Boolean(item.disabled)
            delete item.project_name
        })
        return res
    }

    public async create(data: ProjectData) {
        try {
            const { mysql } = this.app
            const id = uuidv1().replace(/\-/g, '')
            const SQL = 'INSERT INTO project (id, project_name) VALUES (?,?)'
            const selectSql = `SELECT * FROM project WHERE id='${id}'`


            // res:
            // OkPacket {
            //   fieldCount: 0,
            //   affectedRows: 1,
            //   insertId: 0,
            //   serverStatus: 2,
            //   warningCount: 0,
            //   message: '',
            //   protocol41: true,
            //   changedRows: 0
            // }

            // current: Array< RowDataPacket >
            // [
            //   RowDataPacket {
            //     id: '1a3b79d0cbc611eaaf05657b742d6ea8',
            //     project_name: 'zooooo',
            //     create_time: 2020-07-22T02:50:29.000Z,
            //     update_time: 2020-07-22T02:50:29.000Z
            //   }
            // ]

            const res = await mysql.query(SQL, [ id, data.name ])
            if (res.affectedRows >= 1) {
                const [ current ] = await mysql.query(selectSql)
                return current
            }
            return null
        } catch (e) {
            throw e
        }
    }

    public async update(data: ProjectData) {
        if (data.id === 'has_removed') {
            this.ctx.status = 403
            throw new Error('不可编辑')
        }
        try {
            const { mysql } = this.app
            const { id, name, fontFace } = data
            const updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
            const SQL = `UPDATE project SET project_name=?, update_time=?, font_face=? WHERE id=?`
            // const selectSql = `
            //                     SELECT *,
            //                     project_name as name,
            //                     DATE_FORMAT(create_time, '%Y-%m-%d %T') as create_time,
            //                     DATE_FORMAT(update_time, '%Y-%m-%d %T') as update_time
            //                     FROM project WHERE id='${id}'
            //                   `
            const selectSql = `SELECT * FROM project WHERE id='${data.id}'`

            // res:
            // OkPacket {
            //   fieldCount: 0,
            //   affectedRows: 1,
            //   insertId: 0,
            //   serverStatus: 2,
            //   warningCount: 0,
            //   message: '(Rows matched: 1  Changed: 1  Warnings: 0',
            //   protocol41: true,
            //   changedRows: 1
            // }

            const res = await mysql.query(SQL, [ name, updateTime, id, fontFace])
            if (res.affectedRows >= 1) {
                const [ current ] = await mysql.query(selectSql)
                delete current.project_name
                return current
            }
            return null
        } catch (e) {
            throw e
        }
    }

    public async destroy(id) {
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
