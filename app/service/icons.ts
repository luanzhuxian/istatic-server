import { Service } from 'egg'
import pinyin = require('pinyin')
import { readStreamPromise } from '../../lib/utils'
import cheerio = require('cheerio')
import crypto = require('crypto')

export default class Icons extends Service {
  timer: any = 0
  public async getList (query) {
    const { visible, projectId } = query
    const SQL = `SELECT * FROM icons WHERE project_id = ? AND visible = ?`
    const oldHash = await this.app.redis.hget('pl-icon-hash', `svg-pro-id-${projectId}`)
    const list = await this.app.mysql.query(SQL, [ projectId, visible ])
    const newHash = await this.getHash(list)
    return {
      changed: list.length && visible === '1' ? oldHash !== newHash : false,
      list
    }
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
    })
      .flat(2)
      .join('')

    try {
      const checkSql = `SELECT icon_name from icons WHERE icon_name LIKE ?`
      const insertSql = 'INSERT INTO icons (id, content, icon_name, icon_desc, project_id, namespace) VALUES (REPLACE(UUID(), "-", ""), ?, ?, ?, ?, ?)'
      const has = await mysql.query(checkSql, [ 'pl-' + namePingYin + '%' ])
      // 如果发现重名的图标，自动拼接序号
      if (has.length) {
        namePingYin += `-${has.length}`
      }
      namePingYin = 'pl-' + namePingYin

      // 删除svg上的无用信息
      let content = buffer.toString('utf8')
      const $ = cheerio.load(content)
      $('svg')
        .removeAttr('width')
        .removeAttr('height')
        .removeAttr('fill')
        .removeAttr('xmlns')
        .removeAttr('xlink')
        .removeAttr('xmlns:xlink')
        .attr('id', namePingYin)
      content = $('body').html()
      // 重新上传的处理
      if (fields.id) {
        return this.update(fields.id, {
          content
        })
      }

      const res = await mysql.query(insertSql, [
        content,
        namePingYin,
        filename,
        fields.projectId,
        fields.namespace || null
      ])
      await this.updateProject(fields.projectId)
      return res
    } catch (e) {
      throw e
    }
  }
  public async destroy (id) {
    const sql = `DELETE FROM icons WHERE id = ?`
    const current = await this.app.mysql.query(`SELECT project_id FROM icons WHERE id = ?`, [ id ])
    const res = await this.app.mysql.query(sql, [ id ])
    await this.updateProject(current[0].project_id)
    return res
  }
  public async update (id, body) {
    const mysql = this.app.mysql
    const querySql = `SELECT * FROM icons WHERE id = ?`
    const updateSql = `UPDATE icons SET icon_name = ?, icon_desc = ?, content = ?, project_id = ?, namespace = ?, visible = ? WHERE id = ?`
    let icon = await mysql.query(querySql, [ id ])
    icon = icon[0]
    const {
      visible,
      name = icon.icon_name,
      desc = icon.icon_desc,
      projectId = icon.project_id,
      content = icon.content,
      namespace = icon.namespace
    } = body
    await mysql.query(updateSql, [ name, desc, content, projectId, namespace, visible, id ])
    const res = await mysql.query(querySql, [ id ])
    await this.updateProject(projectId)
    return res
  }
  // 更新项目修改时间
  private async updateProject (projectId) {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      const SQL = 'UPDATE project set update_time = NOW() WHERE id = ?'
      this.app.mysql.query(SQL, [ projectId ])
    }, 100)
  }
  // 获取当前所有图标的hash值
  private async getHash (list) {
    const hash = crypto.createHash('sha256')
    const svgStr = list.map(item => item.id).join('')
    return new Promise(resolve => {
      hash.on('readable', () => {
        const data = hash.read()
        if (data) {
          resolve(data.toString('hex'))
        }
      })
      hash.write(svgStr)
      hash.end()
    })
  }
  // 更新hash
  // private async updateSvgHash () {
  //   const hash = crypto.createHash('sha256')
  //   const svg = await this.app.mysql.query('SELECT content FROM icons WHERE visible = 1')
  //   hash.on('readable', () => {
  //     const data = hash.read()
  //     if (data) {
  //       const hashCode = data.toString('hex')
  //       this.app.redis.set('svg', hashCode)
  //     }
  //   })
  //   const svgStr = svg.map(item => item.content).join('')
  //   hash.write(svgStr)
  //   hash.end()
  // }
}
