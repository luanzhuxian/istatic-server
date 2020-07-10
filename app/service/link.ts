import { Service } from 'egg'
import { Readable } from "stream"
import uuidv1 = require('uuid/v1')
import crypto = require('crypto')
// import cheerio = require('cheerio')

export default class Icons extends Service {
  public async index (projectId) {
    const sql = `
      SELECT id, 
      js as link, 
      DATE_FORMAT(create_time, '%Y-%m-%d %T') as create_time 
      FROM link  
      WHERE project_id = ? 
      ORDER BY create_time DESC LIMIT 1 OFFSET 0
    `
    const res = await this.app.mysql.query(sql, [ projectId ])
    return res[0] || {
      id: '',
      link: '',
      create_time: ''
    }
  }

  /**
   * 生成在线链接
   */
  public async create (projectId) {
    const SQL = `
      SELECT content, id 
      FROM icons 
      WHERE visible = 1 AND project_id = ? 
      ORDER BY update_time desc
    `
    const svgs = await this.app.mysql.query(SQL, [ projectId ])

    // 将拼接在一起的图标修改为精灵
    const spirit = svgs.map(item => item.content).join('').replace(/svg/g, 'symbol')

    // 生成执行 js 文件，分配新的 buffer
    const svgScript = Buffer.from(this.createSvgScript(spirit))

    try {
      const filename = uuidv1()
      const fileStream = new Readable({
        autoDestroy: true,
        read () {
          this.push(svgScript)
          this.push(null)
        }
      })

      // https://mallcdn.youpenglai.com/pl-icons/66e6a1f0-c032-11ea-871e-a1f8066f6847.js
      const res = await this.app.ossClient.putStream(`pl-icons/${filename}.js`, fileStream)
      const url = `https://mallcdn.youpenglai.com/${res.name}`
      // 存储url
      await this.saveLink(url, svgs, projectId)
      return {
        key: res.name,
        url
      }
    } catch (e) {
      throw e
    }
  }

  /**
   * 存储链接，并为当前 spirit 生成 hash 值，通过 hash 值可判断图标是否发生过修改
   * @param js {string} js链接地址
   * @param projectId {string} 项目id
   * @param svgs {array} svg 精灵
   */
  public saveLink (js, svgs, projectId) {
    const hash = crypto.createHash('sha256')
    const svgStr = svgs.map(item => item.id).join('')

    return new Promise((resolve, reject) => {
      hash.on('readable', async () => {
        // 哈希流只会生成一个元素。
        const data = hash.read()
        if (data) {
          const SQL = 'INSERT INTO link (id, js, hash, project_id) VALUES (?,?,?,?)'
          const id = uuidv1().replace(/\-/g, '')
          const hashCode = data.toString('hex')

          try {
            // 存入 redis 哈希表
            await this.app.redis.hset('svg-link', `svg-pro-id-${projectId}`, hashCode)
            const res = await this.app.mysql.query(SQL, [ id, js, hashCode, projectId ])
            resolve(res)
          } catch (e) {
            reject(e)
          }
        }
      })
      hash.write(svgStr)
      hash.end()
    })
  }
  
  private createSvgScript (spirit) {
    return '!function(t){var h,v=`<svg>' + spirit + '</svg>`,l=(h=document.getElementsByTagName("script"))[h.length-1].getAttribute("data-injectcss");if(l&&!t.__iconfont__svg__cssinject__){t.__iconfont__svg__cssinject__=!0;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(h){console&&console.log(h)}}!function(h){if(document.addEventListener)if(~["complete","loaded","interactive"].indexOf(document.readyState))setTimeout(h,0);else{var l=function(){document.removeEventListener("DOMContentLoaded",l,!1),h()};document.addEventListener("DOMContentLoaded",l,!1)}else document.attachEvent&&(a=h,c=t.document,z=!1,(m=function(){try{c.documentElement.doScroll("left")}catch(h){return void setTimeout(m,50)}v()})(),c.onreadystatechange=function(){"complete"==c.readyState&&(c.onreadystatechange=null,v())});function v(){z||(z=!0,a())}var a,c,z,m}(function(){var h,l;(h=document.createElement("div")).innerHTML=v,v=null,(l=h.getElementsByTagName("svg")[0])&&(l.setAttribute("aria-hidden","true"),l.style.position="absolute",l.style.width=0,l.style.height=0,l.style.overflow="hidden",function(h,l){l.firstChild?function(h,l){l.parentNode.insertBefore(h,l)}(h,l.firstChild):l.appendChild(h)}(l,document.body))})}(window);'
  }
}
