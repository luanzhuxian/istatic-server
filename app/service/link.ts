import { Service } from 'egg'
import Oss = require("ali-oss")
import { getSTS } from '../../apis/oss'
import fs = require('fs')
import path = require('path')
import cheerio = require('cheerio')
export default class Icons extends Service {
  /**
   * 生成在线链接
   */
  public async index () {
    const SQL = `SELECT * FROM icons`
    const svgs = await this.app.mysql.query(SQL)
    let str = ''
    for (const svg of svgs) {
      let content = svg.content
      const $ = cheerio.load(content)
      $('svg').removeAttr('width')
      $('svg').removeAttr('height')
      $('svg').removeAttr('fill')
      $('svg').removeAttr('xmlns')
      $('svg').removeAttr('xmlns:xlink')
      $('svg').attr('id', svg.icon_name)
      content = $('body').html()
      // content = content.replace(/<svg\s+[\s\S]*(width\s*=\s*"[^"]*")[\s\S]*?<\/svg>/gi, (text: string, a) => {
      //   return text.replace(a, '')
      // })
      // content = content.replace(/<svg\s+[\s\S]*(height\s*=\s*"[^"]*")[\s\S]*?<\/svg>/gi, (text: string, a) => {
      //   return text.replace(a, '')
      // })
      // content = content.replace(/<svg\s+[\s\S]*(fill\s*=\s*"[^"]*")[\s\S]*?<\/svg>/gi, (text: string, a) => {
      //   return text.replace(a, '')
      // })
      // content = content.replace(/svg/gi, 'symbol')
      str += content + '\r\n'
    }
    str = `<svg>\r\n${str}\r\n</svg>`
    const fn =
      "(function(){" +
        "let svg = document.createElement('svg');" +
        "svg.style.display = 'none';" +
        "svg.innerHTML = `" + str + "`;" +
        "document.body.appendChild(svg);" +
      "}())"
    fs.writeFileSync(path.join(__dirname, '../../temp/temp.js'), fn, { encoding: 'utf8' })

    try {
      const { data } = await getSTS()
      console.log(data.result)
      const { accessKeySecret, accessKeyId } = data.result.credentials
      // console.log(securityToken, accessKeySecret, accessKeyId)
      const OSS = new Oss({
        region: 'oss-cn-hangzhou',
        // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
        accessKeyId,
        accessKeySecret,
        bucket: 'penglai-weimall'
      })
      console.log(OSS)
    } catch (e) {
      console.log(e)
    }
  }
}
