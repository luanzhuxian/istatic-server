import { Service } from 'egg'
import fs = require("fs")
import { join } from "path"
import uuidv4 = require('uuid/v4')
import cheerio = require('cheerio')
import crypto = require('crypto')
import moment = require('moment')
import { checkIconName } from '../../lib/validate'

// import { readStreamPromise } from '../../lib/utils'

export default class IconsService extends Service {
    timer: any = 0

    public async getList(query) {
        const { projectId = '', visible } = query
        const SQL = `
                        SELECT *
                        FROM icons
                        WHERE project_id = ? AND visible = ?
                        ORDER BY update_time desc
                    `
        // 从 redis 哈希表读取
        const oldHash = await this.app.redis.hget('icon-hash', `svg-pro-id-${projectId}`)
        console.log(oldHash)
        const svgs = await this.app.mysql.query(SQL, [ projectId, visible ])
        const newHash = await this.generateHash(svgs.map(item => item.id).join(''))

        return {
            changed: svgs.length && visible === '1' ? oldHash !== newHash : false,
            list: svgs
        }
    }


    // {
    //   file: FileStream {
    //     _readableState: ReadableState {
    //       ......
    //     },
    //     readable: true,
    //     _events: [Object: null prototype] { end: [Function] },
    //     _eventsCount: 1,
    //     _maxListeners: undefined,
    //     truncated: false,
    //     _read: [Function],
    //     fieldname: 'file0',
    //     filename: 'pdf.svg',
    //     encoding: '7bit',
    //     transferEncoding: '7bit',
    //     mime: 'image/svg+xml',
    //     mimeType: 'image/svg+xml'
    //   },
    //   projectId: 'fe866070c35411ea9a75e9092ba39518',
    //   id: ''
    // }

    // content: buffer 转字符串
    // <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 18 18">
    //   <defs>
    //     <style>
    //       .cls-1 {
    //         fill: #c7ced5;
    //       }
    //       .cls-2 {
    //         clip-path: url(#clip-path);
    //       }
    //       .cls-3 {
    //         fill: #fe7700;
    //       }
    //       .cls-4 {
    //         fill: none;
    //         stroke: #fe7700;
    //         stroke-linecap: round;
    //         stroke-width: 2px;
    //       }
    //     </style>
    //     <clipPath id="clip-path">
    //       <rect id="矩形_224" data-name="矩形 224" class="cls-1" width="18" height="18" transform="translate(10 441)"/>
    //     </clipPath>
    //   </defs>
    //   <g id="蒙版组_5" data-name="蒙版组 5" class="cls-2" transform="translate(-10 -441)">
    //     <g id="课程" transform="translate(10 442)">
    //       <path id="路径_1" data-name="路径 1" class="cls-3" d="M3,0H15a2.946,2.946,0,0,1,3,3V13a2.946,2.946,0,0,1-3,3H3a2.946,2.946,0,0,1-3-3V3A2.946,2.946,0,0,1,3,0ZM3,1.5A1.538,1.538,0,0,0,1.5,3V13A1.538,1.538,0,0,0,3,14.5H15A1.538,1.538,0,0,0,16.5,13V3A1.538,1.538,0,0,0,15,1.5Z"/>
    //       <line id="直线_5" data-name="直线 5" class="cls-4" y2="3.739" transform="translate(13.5 8.761)"/>
    //       <line id="直线_6" data-name="直线 6" class="cls-4" y2="5.608" transform="translate(9.5 6.892)"/>
    //       <line id="直线_7" data-name="直线 7" class="cls-4" y2="8.545" transform="translate(5.5 3.955)"/>
    //     </g>
    //   </g>
    // </svg>

    // 最后处理完的 content
    // <svg viewBox="0 0 18 18" id="icon-mengbanzu 5(1)-cd584">
    //   <defs>
    //     <style>
    //       .bfbbbdffdea {
    //         fill: #c7ced5;
    //       }
    //       .dbbfa {
    //         clip-path: url(#deabaadea);
    //       }
    //       .bafebacfdecb {
    //         fill: #fe7700;
    //       }
    //       .efafdadcdcfaedb {
    //         fill: none;
    //         stroke: #fe7700;
    //         stroke-linecap: round;
    //         stroke-width: 2px;
    //       }
    //     </style>
    //     <clipPath id="deabaadea">
    //       <rect id="bebbfbdaeea" data-name="&#x77E9;&#x5F62; 224" class="bfbbbdffdea" width="18" height="18" transform="translate(10 441)"/>
    //     </clipPath>
    //   </defs>
    //   <g id="cbfaddbccaf" data-name="&#x8499;&#x7248;&#x7EC4; 5" class="dbbfa" transform="translate(-10 -441)">
    //     <g id="fedcbbdfcabfdf" transform="translate(10 442)">
    //       <path id="cfadcaece" data-name="&#x8DEF;&#x5F84; 1" class="bafebacfdecb" d="M3,0H15a2.946,2.946,0,0,1,3,3V13a2.946,2.946,0,0,1-3,3H3a2.946,2.946,0,0,1-3-3V3A2.946,2.946,0,0,1,3,0ZM3,1.5A1.538,1.538,0,0,0,1.5,3V13A1.538,1.538,0,0,0,3,14.5H15A1.538,1.538,0,0,0,16.5,13V3A1.538,1.538,0,0,0,15,1.5Z"/>
    //       <line id="fdaaaeabdbacf" data-name="&#x76F4;&#x7EBF; 5" class="efafdadcdcfaedb" y2="3.739" transform="translate(13.5 8.761)"/>
    //       <line id="cafebbebfedcf" data-name="&#x76F4;&#x7EBF; 6" class="efafdadcdcfaedb" y2="5.608" transform="translate(9.5 6.892)"/>
    //       <line id="bddcddcbffccdeeedc" data-name="&#x76F4;&#x7EBF; 7" class="efafdadcdcfaedb" y2="8.545" transform="translate(5.5 3.955)"/>
    //     </g>
    //   </g>
    // </svg>


    public async create(data) {
        const { mysql } = this.app
        const {
            file,
            id,
            projectId,
            namespace
        } = data
        const project = await mysql.query('SELECT font_face from project WHERE id = ?', [ projectId ])
        const fontFace = project[0].font_face
        const chunks: Buffer[] = []
        const filename = file.filename.split('.')[0]
        const name = `${ fontFace }-${filename}`

        // 图标上传时不再默认添加hash，改为校验图标名称
        if (!checkIconName(filename)) {
            this.ctx.status = 422
            throw new Error('文件名只能是字母、数字、_ 或 -')
        }
        const iconExists = await this.iconExists(name, projectId)
        console.log('图标是否存在：', iconExists)
        if (iconExists) {
            this.ctx.status = 422
            throw new Error('文件名重复，请修改')
        }

        let chunkLen = 0
        let content = ''
        // let hash = ''

        // for of 也是消费流的一种方法
        for await (const chunk of file) {
            chunks.push(chunk)
            chunkLen += chunk.length
        }
        // 转字符串
        content = Buffer.concat(chunks, chunkLen).toString('utf8')

        // 封装另一种消费流的方法 on('data')
        // let buffer = await readStreamPromise(file)
        // let content = buffer.toString('utf8')

        content = this.modifySvgsId(content)

        // 生成唯一哈希值，避免名字重复，如 icon-pdf-887fd
        let hash = await this.generateHash(content)
        hash = hash.substring(0, 5)

        // 解析 html
        // 将svg转成“DOM”, 然后对其中的一些属性进行操作
        const $ = cheerio.load(content)
        const $svg = $('svg')

        // 增加 id 属性
        // $('svg').attr('id', name)
        $svg.attr('id', name)
        const viewBox = $svg.attr('viewBox').split(' ')
        // 没有宽时从viewBox取
        if (!$svg.attr('width')) $svg.attr('width', viewBox[2])
        // 没有高时从viewBox取
        if (!$svg.attr('height')) $svg.attr('height', viewBox[3])
        // 保存宽度
        const width = $svg.attr('width')
        // 保存高度
        const height = $svg.attr('height')

        // 删除 svg 上没有用的一些属性
        $svg.removeAttr('width')
        $svg.removeAttr('height')
        $svg.removeAttr('xlink')
        $svg.removeAttr('xmlns')
        $svg.removeAttr('t')
        $svg.removeAttr('style')
        // TODO:
        content = $('body').html()

        // 重新上传的处理
        if (id) {
            return this.update(id, {
                content
            })
        }

        const insertSql = 'INSERT INTO icons (id, content, icon_name, icon_desc, project_id, namespace, unicode, width, height) VALUES (REPLACE(UUID(), "-", ""), ?, ?, ?, ?, ?, ?, ?, ?)'
        const maxUnicode = await mysql.query('SELECT unicode from icons ORDER BY unicode desc LIMIT 1')
        await mysql.query(insertSql, [
            content,
            name,
            filename,
            projectId,
            namespace,
            maxUnicode && maxUnicode.length ? ++maxUnicode[0].unicode : 61697,
            width,
            height
        ])
        await this.updateProject(projectId)
        return true
    }

    public async update(id, body) {
        const { mysql } = this.app
        const querySql = 'SELECT * FROM icons WHERE id = ?'
        const updateSql = 'UPDATE icons SET icon_name = ?, icon_desc = ?, content = ?, project_id = ?, namespace = ?, visible = ?, update_time = ? WHERE id = ?'

        const [ icon ] = await mysql.query(querySql, [ id ])
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
        await this.updateProject(projectId)

        return res
    }

    public async destroy(id) {
        const querySql = 'SELECT project_id FROM icons WHERE id = ?'
        const deleteSql = 'DELETE FROM icons WHERE id = ?'

        const [ current ] = await this.app.mysql.query(querySql, [ id ])
        const res = await this.app.mysql.query(deleteSql, [ id ])
        await this.updateProject(current.project_id)
        return res
    }

    // 更新项目修改时间
    private async updateProject(projectId) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            const SQL = 'UPDATE project set update_time = NOW() WHERE id = ?'
            this.app.mysql.query(SQL, [ projectId ])
        }, 100)
    }

    // 根据当前图标的内容生成 hash 值
    private async generateHash(str): Promise<string> {
        const hash = crypto.createHash('sha256')
        hash.write(str)
        hash.end()

        return new Promise(resolve => {
            hash.on('readable', () => {
                // 哈希流只会生成一个元素。
                const data = hash.read()
                if (data) {
                    resolve(data.toString('hex'))
                }
            })
        })
    }

    // TODO:
    /**
     * 修改svg中的一些属性(id 和 class等), 避免不同svg之间存在属性值重复( id )的情况
     * @param svg {cheerio}
     */
    private modifySvgsId(svg) {
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

    private async iconExists (iconName: string, project_id: string): Promise<boolean> {
        const list = await this.app.mysql.query('SELECT * FROM icons  WHERE icon_name = ? AND project_id = ?', [ iconName, project_id ])
        return Boolean(list && list.length)
    }

    public async demo () {
        // const svgs = await this.app.mysql.query('SELECT id,content from icons WHERE project_id="92ab0da0f0d711ea9c368dc4eae83408"')
        // const sq1 = 'UPDATE icons SET width = ? WHERE project_id = "a9c63dd044f111eabb107986812f97fb" AND icon_name = ?'
        // const sq2 = 'UPDATE icons SET height = ? WHERE project_id = "a9c63dd044f111eabb107986812f97fb" AND icon_name = ?'
        // const sq3 = 'UPDATE icons SET content = ? WHERE project_id = "a9c63dd044f111eabb107986812f97fb" AND icon_name = ?'
        const svgSymbol = fs.readFileSync(join(__dirname, 'admall.txt'), { encoding: 'utf8' })
        // console.log(svgSymbol)
        const $ = cheerio.load(svgSymbol)
        const symbols = $('symbol')
        for (let i = 0; i < symbols.length; i++) {
          const c = $(symbols[i])
          // const $svg = $('<svg></svg>')
          // const attrs = c.attr()
          console.log(c.removeAttr('viewBox'))
          // for (const at of Object.keys(attrs)) {
            // const viewBox = c.attr('viewBox').split(' ')
            // if (!c.attr('width')) {
            //   c.attr('width', viewBox[2])
            // }
            // if (!c.attr('height')) {
            //   c.attr('height', viewBox[3])
            // }
            // if (at === 'xmlns' || at === 'height' || at === 'width' || at === 'xmlns:xlink' || at === 'xlink') {
            //   continue
            // }
            // $svg.attr(at, attrs[at])
          // }
          // console.log(c.attr('width'), c.attr('height'), c.attr('id'))
          // await this.app.mysql.query(sq1, [ c.attr('width'), c.attr('id') ])
          // await this.app.mysql.query(sq2, [ c.attr('height'), c.attr('id') ])
          // await this.app.mysql.query(sq3, [ $svg.html(c.html()).toString(), c.attr('id') ])
          // console.log(c.attr().width)
          // console.log($svg.html(c.html()).toString())
        }
        // for (const sym of $('symbol')) {
        //   console.log(sym.html())
        // }
        // for (const svg of svgs) {
        //   const $ = cheerio.load(svg.content)
        //   const $svg = $('svg')
        //   const viewBox = $svg.attr('viewBox')
        //   const width = $svg.attr('width') || viewBox.split(' ')[2]
        //   const height = $svg.attr('height') || viewBox.split(' ')[3]
        //   const sq1 = 'UPDATE icons SET width = ?'
        //   const sq2 = 'UPDATE icons SET height = ?'
        //   const sq3 = 'UPDATE icons SET content = ?'
        //   await this.app.mysql.query(sq1, [ width ])
        //   await this.app.mysql.query(sq2, [ height ])
        //   $('svg').attr('width', null)
        //   $('svg').attr('height', null)
        //   $('svg').attr('xmlns', null)
        //   $('svg').attr('xmlns:xlink', null)
        //   $('svg').attr('xlink', null)
        //   const content = $('body').html()
        //   await this.app.mysql.query(sq3, [ content ])
        // }
        return 1
    }
}
