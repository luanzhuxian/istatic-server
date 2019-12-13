import { Service } from 'egg'
import pinyin = require('pinyin')
import uuidv4 = require("uuid/v4")
import moment = require("moment")
import cheerio = require('cheerio')
import crypto = require('crypto')

export default class Icons extends Service {
  timer: any = 0
  public async getList (query) {
    const { visible, projectId = '' } = query
    const SQL = `
      SELECT *
      FROM icons
      WHERE project_id = ? AND visible = ?
      ORDER BY update_time desc
    `
    const oldHash = await this.app.redis.hget('pl-icon-hash', `svg-pro-id-${projectId}`)
    const list = await this.app.mysql.query(SQL, [ projectId, visible ])
    const newHash = await this.getHash(list)
    return {
      changed: list.length && visible === '1' ? oldHash !== newHash : false,
      list
    }
  }
  public async create (data) {
    const mysql = this.app.mysql
    const {
      file,
      id,
      projectId,
      namespace
    } = data
    const chunks: Buffer[] = []
    const filename = file.filename.split('.')[0]
    let chunkLen = 0

    // 如果文件名是中文的，转成拼音
    let namePingYin = pinyin(filename, {
      heteronym: false,
      segment: false,
      style: pinyin.STYLE_NORMAL
    })
      .flat(2)
      .join('')
    for await (const chunk of file) {
      chunks.push(chunk)
      chunkLen += chunk.length
    }
    let content = Buffer.concat(chunks, chunkLen).toString('utf8')
    content = this.modifySvgsId(content)
    const $ = cheerio.load(content)
    // 删除svg上没有用的一些属性
    this.removeSvgsAttr($)
    $('svg').attr('id', 'icon-' + namePingYin)
    content = $('body').html()
    // 重新上传的处理
    if (id) {
      return this.update(id, {
        content
      })
    }
    // 查看当前项目是否存在同名图标，或者名字类似的图标，为放置重复，在名称后添加序号
    const checkSql = `SELECT icon_name from icons WHERE icon_name LIKE ? AND project_id = ?`
    const insertSql = 'INSERT INTO icons (id, content, icon_name, icon_desc, project_id, namespace) VALUES (REPLACE(UUID(), "-", ""), ?, ?, ?, ?, ?)'
    const has = await mysql.query(checkSql, [ '%' + namePingYin + '%', projectId ])
    // 如果发现重名的图标，自动拼接序号
    if (has.length) {
      namePingYin += `-${has.length}`
    }
    await mysql.query(insertSql, [
      content,
      'icon-' + namePingYin,
      filename,
      projectId,
      namespace
    ])
    await this.updateProject(projectId)
    return true
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
    const updateSql = `UPDATE icons SET icon_name = ?, icon_desc = ?, content = ?, project_id = ?, namespace = ?, visible = ?, update_time = ? WHERE id = ?`
    let icon = await mysql.query(querySql, [ id ])
    icon = icon[0]
    const {
      visible = icon.visible,
      name = icon.icon_name,
      desc = icon.icon_desc,
      projectId = icon.project_id,
      content = icon.content,
      namespace = icon.namespace
    } = body
    const updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
    await mysql.query(updateSql, [ name, desc, content, projectId, namespace, visible, updateTime, id ])
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
    hash.write(svgStr)
    hash.end()
    return new Promise(resolve => {
      hash.on('readable', () => {
        const data = hash.read()
        if (data) {
          resolve(data.toString('hex'))
        }
      })
    })
  }
  /**
   * 修改svg中的id, 避免不同svg之间id重复
   * @param svg {cheerio}
   */
  private modifySvgsId (svg) {
    const ids = svg.matchAll(/id\s*=\s*"([^"]+)"/gi)
    for (const val of ids) {
      const newId = uuidv4().replace(/\-/g, '').replace(/\d/g, '')
      svg = svg.replace(new RegExp(`${val[0]}`, 'gim'), `id="${newId}"`)
      svg = svg.replace(new RegExp(`"#${val[1]}"`, 'gim'), `"#${newId}"`)
      svg = svg.replace(new RegExp(`\\(#${val[1]}\\)`, 'gim'), `(#${newId})`)
    }
    const classes = svg.matchAll(/class\s*=\s*"([^"]+)"/gi)
    for (const val of classes) {
      const newClass = uuidv4().replace(/\-/g, '').replace(/\d/g, '')
      svg = svg.replace(new RegExp(`${val[1]}`, 'gim'), newClass)
    }
    return svg
  }
  private removeSvgsAttr ($) {
    $('svg')
      .removeAttr('width')
      .removeAttr('height')
      .removeAttr('fill')
      .removeAttr('xmlns')
      .removeAttr('xlink')
      .removeAttr('version')
      .removeAttr('t')
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
