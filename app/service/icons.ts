import { Service } from 'egg'
import moment = require("moment")
import pinyin = require('pinyin')
import uuidv4 = require("uuid/v4")
import cheerio = require('cheerio')
import crypto = require('crypto')
// import { readStreamPromise } from '../../lib/utils'

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
    // 从 redis 哈希表读取
    const oldHash = await this.app.redis.hget('svg-link', `svg-pro-id-${projectId}`)
    const list = await this.app.mysql.query(SQL, [ projectId, visible ])
    const newHash = await this.getHash(list.map(item => item.id).join(''))
    
    return {
      changed: list.length && visible === '1' ? oldHash !== newHash : false,
      list
    }
  }

  public async create (data) {
    console.log('icon service - create - data', data)

    const { mysql } = this.app
    const {
      file,
      id,
      projectId,
      namespace
    } = data
    const filename = file.filename.split('.')[0]
    const chunks: Buffer[] = []
    let chunkLen = 0

    for await (const chunk of file) {
      chunks.push(chunk)
      chunkLen += chunk.length
    }

    // let buffer = await readStreamPromise(file)
    // let content = buffer.toString('utf8')

    let content = Buffer.concat(chunks, chunkLen).toString('utf8')

    // console.log('icon service - create - content-1', content)

    content = this.modifySvgsId(content)
    const $ = cheerio.load(content) // 解析 html

    // 生成唯一哈希值，避免名字重复，如 icon-pdf-887fd
    let hash = await this.getHash(content)
    hash = hash.substring(0, 5)
    
    // 如果文件名是中文的，转成拼音
    const namePingYin = pinyin(filename, {
      heteronym: false,
      segment: false,
      style: pinyin.STYLE_NORMAL
    }).flat(2).join('')
    const name = `icon-${namePingYin}-${hash}`

    // 删除 svg 上没有用的一些属性
    this.removeSvgsAttr($)
    // 增加 id 属性
    $('svg').attr('id', name)
    content = $('body').html()

    // console.log('icon service - create - content-2', content)
    // console.log('icon service - create - $', $('body').html())

    // 重新上传的处理
    if (id) {
      return this.update(id, {
        content
      })
    }

    const insertSql = 'INSERT INTO icons (id, content, icon_name, icon_desc, project_id, namespace) VALUES (REPLACE(UUID(), "-", ""), ?, ?, ?, ?, ?)'
    await mysql.query(insertSql, [
      content,
      name,
      filename,
      projectId,
      namespace
    ])
    await this.updateProjectUpdateTime(projectId)
    return true
  }
  
  public async update (id, body) {
    const { mysql } = this.app
    const querySql = `SELECT * FROM icons WHERE id = ?`
    const updateSql = `UPDATE icons SET icon_name = ?, icon_desc = ?, content = ?, project_id = ?, namespace = ?, visible = ?, update_time = ? WHERE id = ?`
    
    const icons = await mysql.query(querySql, [ id ])
    const icon = icons[0]
    // body 中包含哪个字段就更新哪个，比如 body = { visible: 0 }，相当于值更新了 visible 字段
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
    await this.updateProjectUpdateTime(projectId)
    
    return res
  }

  public async destroy (id) {
    const querySql = `SELECT project_id FROM icons WHERE id = ?`
    const deleteSql = `DELETE FROM icons WHERE id = ?`

    const current = await this.app.mysql.query(querySql, [ id ])
    const res = await this.app.mysql.query(deleteSql, [ id ])
    await this.updateProjectUpdateTime(current[0].project_id)
    return res
  }

  // 更新项目修改时间
  private async updateProjectUpdateTime (projectId) {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      const SQL = 'UPDATE project set update_time = NOW() WHERE id = ?'
      this.app.mysql.query(SQL, [ projectId ])
    }, 100)
  }

  // 根据当前图标的内容生成 hash 值
  private async getHash (str): Promise<string> {
    const hash = crypto.createHash('sha256')
    hash.write(str)
    hash.end()

    return new Promise(resolve => {
      hash.on('readable', () => {
        // 哈希流只会生成一个元素。
        const data = hash.read()
        if (data) {
          // buffer.toString([encoding[, start[, end]]])
          resolve(data.toString('hex'))
        }
      })
    })
  }

  /**
   * 修改 svg 中的 id, 避免不同 svg 之间 id 重复
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
