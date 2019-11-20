import { Service } from 'egg'
import Oss = require("ali-oss")
import { getSTS } from '../../apis/oss'
import fs = require('fs')
import path = require('path')
import cheerio = require('cheerio')
import uuidv1 = require('uuid/v1')
import crypto = require('crypto')

export default class Icons extends Service {
  /**
   * 生成在线链接
   */
  public async index () {
    const SQL = `SELECT * FROM icons WHERE visible = 1`
    const svgs = await this.app.mysql.query(SQL)
    let str = ''
    for (const svg of svgs) {
      let content = svg.content
      const $ = cheerio.load(content)
      $('svg')
        .removeAttr('width')
        .removeAttr('height')
        .removeAttr('fill')
        .removeAttr('xmlns')
        .removeAttr('xlink')
        .removeAttr('xmlns:xlink')
        .attr('id', svg.icon_name)
      content = $('body').html()
      content = content.replace('svg', 'symbol')
      content = content.replace('svg', 'symbol')
      str += content
    }
    const svgScript = '!function(t){var h,v=`<svg>' + str + '</svg>`,l=(h=document.getElementsByTagName("script"))[h.length-1].getAttribute("data-injectcss");if(l&&!t.__iconfont__svg__cssinject__){t.__iconfont__svg__cssinject__=!0;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(h){console&&console.log(h)}}!function(h){if(document.addEventListener)if(~["complete","loaded","interactive"].indexOf(document.readyState))setTimeout(h,0);else{var l=function(){document.removeEventListener("DOMContentLoaded",l,!1),h()};document.addEventListener("DOMContentLoaded",l,!1)}else document.attachEvent&&(a=h,c=t.document,z=!1,(m=function(){try{c.documentElement.doScroll("left")}catch(h){return void setTimeout(m,50)}v()})(),c.onreadystatechange=function(){"complete"==c.readyState&&(c.onreadystatechange=null,v())});function v(){z||(z=!0,a())}var a,c,z,m}(function(){var h,l;(h=document.createElement("div")).innerHTML=v,v=null,(l=h.getElementsByTagName("svg")[0])&&(l.setAttribute("aria-hidden","true"),l.style.position="absolute",l.style.width=0,l.style.height=0,l.style.overflow="hidden",function(h,l){l.firstChild?function(h,l){l.parentNode.insertBefore(h,l)}(h,l.firstChild):l.appendChild(h)}(l,document.body))})}(window);'
    try {
      const { data } = await getSTS()
      const { accessKeySecret, accessKeyId, securityToken } = data.result.credentials
      const filename = uuidv1()
      const filePath = path.join(__dirname, `../../temp/${filename}.js`)
      fs.writeFileSync(filePath, svgScript, { encoding: 'utf8' })
      const stream = fs.createReadStream(filePath)
      const client = new Oss({
        region: 'oss-cn-hangzhou',
        // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
        accessKeyId,
        accessKeySecret,
        stsToken: securityToken,
        bucket: 'penglai-weimall'
      })
      const res = await client.putStream(`pl-icons/${filename}.js`, stream)
      fs.unlinkSync(filePath)
      const url = `https://mallcdn.youpenglai.com/${res.name}`
      // 存储url
      await this.saveLink(url, str)
      return {
        key: res.name,
        url
      }
    } catch (e) {
      throw e
    }
  }

  /**
   * 存储链接，并为当前spirit生成hash值，通过hash值可判断图标是否发生过修改
   * @param js {string} js链接地址
   * @param spirit {string} svg 精灵
   */
  public saveLink (js, spirit) {
    const hash = crypto.createHash('sha256')
    return new Promise((resolve, reject) => {
      hash.on('readable', async () => {
        // 哈希流只会生成一个元素。
        const data = hash.read()
        if (data) {
          const id = uuidv1().replace(/\-/g, '')
          const sql = 'INSERT INTO link (id, js, hash) VALUES (?,?,?)'
          const hashCode = data.toString('hex')
          try {
            const res = await this.app.mysql.query(sql, [ id, js, hashCode ])
            resolve(res)
          } catch (e) {
            reject(e)
          }
        }
      })
      hash.write(spirit)
      hash.end()
    })
  }
}
