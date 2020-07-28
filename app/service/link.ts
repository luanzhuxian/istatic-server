import { Service } from 'egg'
import { Readable, Duplex } from "stream"
import uuidv1 = require('uuid/v1')
import crypto = require('crypto')
// import cheerio = require('cheerio')
// import fs = require('fs')

// Readable – 可读操作
function bufferToReadStream (buffer) {  
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

// Duplex – 可读可写操作
function bufferToDuplexStream (buffer) {  
  const stream = new Duplex()
  stream.push(buffer)
  stream.push(null)
  return stream
}

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

    // res: Array< RowDataPacket >
    // [
    //   RowDataPacket {
    //     id: '7ac0b4d0c4ac11ea93872329f8a316d4',
    //     link: 'https://mallcdn.youpenglai.com/pl-icons/7a7af940-c4ac-11ea-9387-2329f8a316d4.js',
    //     create_time: '2020-07-13 09:59:26'
    //   }
    // ]
    
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

    // [
    //   RowDataPacket {
    //     content: '<svg viewBox="0 0 18 18" id="icon-mengbanzu 4-4b7ad">\n' +
    //       '  <defs>\n' +
    //       '    <style>\n' +
    //       '      .cfbefaadafa {\n' +
    //       '        fill: #c7ced5;\n' +
    //       '      }\n' +
    //       '\n' +
    //       '      .caaafb {\n' +
    //       '        clip-path: url(#abadabe);\n' +
    //       '      }\n' +
    //       '\n' +
    //       '      .beadacbcbace {\n' +
    //       '        fill: #ff3854;\n' +
    //       '      }\n' +
    //       '\n' +
    //       '      .bececcfeffbc {\n' +
    //       '        fill: #fff;\n' +
    //       '      }\n' +
    //       '    </style>\n' +
    //       '    <clipPath id="abadabe">\n' +
    //       '      <rect id="caacdcaddde" data-name="&#x77E9;&#x5F62; 224" class="cfbefaadafa" width="18" height="18" transform="translate(10 441)"/>\n' +
    //       '    </clipPath>\n' +
    //       '  </defs>\n' +
    //       '  <g id="bffbffaedfddcee" data-name="&#x8499;&#x7248;&#x7EC4; 4" class="caaafb" transform="translate(-10 -441)">\n' +
    //       '    <g id="ddbfbbacbddcaf" transform="translate(9.457 440.477)">\n' +
    //       '      <path id="dbbdcfafaabafdecaae" data-name="&#x8DEF;&#x5F84; 1" class="beadacbcbace" d="M9.608,6.076a.7.7,0,0,1-1.036,0l-2.2-2.2a.7.7,0,0,1,0-1.036.7.7,0,0,1,1.036,0l2.2,2.2A.7.7,0,0,1,9.608,6.076Z"/>\n' +
    //       '      <path id="edbaabedba" data-name="&#x8DEF;&#x5F84; 2" class="beadacbcbace" d="M9.306,6.076a.7.7,0,0,1,0-1.036l3.367-3.367a.7.7,0,0,1,1.036,0,.7.7,0,0,1,0,1.036L10.342,6.076A.7.7,0,0,1,9.306,6.076Z"/>\n' +
    //       '      <path id="cedcadbfdda" data-name="&#x8DEF;&#x5F84; 3" class="beadacbcbace" d="M17.507,17.6H1.579A1.05,1.05,0,0,1,.543,16.565V5.86A1.05,1.05,0,0,1,1.579,4.824H17.507A1.05,1.05,0,0,1,18.543,5.86V16.565A1.05,1.05,0,0,1,17.507,17.6Z"/>\n' +
    //       '      <path id="eebeecafbcda" data-name="&#x8DEF;&#x5F84; 4" class="bececcfeffbc" d="M16.515,16.349H2.572a.682.682,0,0,1-.691-.691V6.766a.682.682,0,0,1,.691-.691H16.514a.682.682,0,0,1,.691.691v8.892a.71.71,0,0,1-.691.691Z"/>\n' +
    //       '      <path id="bcebfbcffebff" data-name="&#x8DEF;&#x5F84; 5" class="beadacbcbace" d="M7.66,13.717h-1a.113.113,0,0,1-.1-.1V9.107a.113.113,0,0,1,.1-.1h1a.113.113,0,0,1,.1.1v4.505a.113.113,0,0,1-.1.1Zm3.719-4.61v.524l-.629,2.515c-.052.1-.21.1-.21,0L9.913,9.631V9.107a.113.113,0,0,0-.1-.1h-1a.113.113,0,0,0-.1.1v.629l1.1,4.034h1.834l1.1-4.034V9.107a.113.113,0,0,0-.1-.1h-1C11.432,8.95,11.38,9,11.38,9.107ZM3.941,12.355V9.107a.113.113,0,0,0-.1-.1h-1a.113.113,0,0,0-.1.1v4.558a.113.113,0,0,0,.1.1H5.67a.113.113,0,0,0,.1-.1V12.617a.113.113,0,0,0-.1-.1H4.15c-.157-.052-.21-.1-.21-.157Zm12.311-2.41V9.055a.113.113,0,0,0-.1-.1H13.632a.113.113,0,0,0-.1.1v4.558a.113.113,0,0,0,.1.1h2.515a.113.113,0,0,0,.1-.1v-.891a.113.113,0,0,0-.1-.1H14.89a.113.113,0,0,1-.1-.1v-.524a.113.113,0,0,1,.1-.1h1.257a.113.113,0,0,0,.1-.1v-.733a.113.113,0,0,0-.1-.1H14.89a.113.113,0,0,1-.1-.1v-.524a.113.113,0,0,1,.1-.1h1.257c.052-.1.1-.157.1-.262Z"/>\n' +
    //       '    </g>\n' +
    //       '  </g>\n' +
    //       '</svg>\n',
    //     id: '8d5dd09ecc0811eaafb38cec4b9bb6de'
    //   }
    // ]
    
    const svgs = await this.app.mysql.query(SQL, [ projectId ])
    // this.test1(svgs)
    // this.test2(svgs)

    // TODO:
    // 将拼接在一起的图标修改为精灵
    const spirit = svgs.map(item => item.content).join('').replace(/svg/g, 'symbol')

    // script:
    // !function(t){var h,v=`

    // <svg>
    // <symbol viewBox="0 0 18 18" id="icon-mengbanzu 4-4b7ad">
    //   <defs>
    //     <style>
    //       .cfbefaadafa {
    //         fill: #c7ced5;
    //       }

    //       .caaafb {
    //         clip-path: url(#abadabe);
    //       }

    //       .beadacbcbace {
    //         fill: #ff3854;
    //       }

    //       .bececcfeffbc {
    //         fill: #fff;
    //       }
    //     </style>
    //     <clipPath id="abadabe">
    //       <rect id="caacdcaddde" data-name="&#x77E9;&#x5F62; 224" class="cfbefaadafa" width="18" height="18" transform="translate(10 441)"/>
    //     </clipPath>
    //   </defs>
    //   <g id="bffbffaedfddcee" data-name="&#x8499;&#x7248;&#x7EC4; 4" class="caaafb"transform="translate(-10 -441)">
    //     <g id="ddbfbbacbddcaf" transform="translate(9.457 440.477)">
    //       <path id="dbbdcfafaabafdecaae" data-name="&#x8DEF;&#x5F84; 1" class="beadacbcbace" d="M9.608,6.076a.7.7,0,0,1-1.036,0l-2.2-2.2a.7.7,0,0,1,0-1.036.7.7,0,0,1,1.036,0l2.2,2.2A.7.7,0,0,1,9.608,6.076Z"/>
    //       <path id="edbaabedba" data-name="&#x8DEF;&#x5F84; 2" class="beadacbcbace"d="M9.306,6.076a.7.7,0,0,1,0-1.036l3.367-3.367a.7.7,0,0,1,1.036,0,.7.7,0,0,1,0,1.036L10.342,6.076A.7.7,0,0,1,9.306,6.076Z"/>
    //       <path id="cedcadbfdda" data-name="&#x8DEF;&#x5F84; 3" class="beadacbcbace" d="M17.507,17.6H1.579A1.05,1.05,0,0,1,.543,16.565V5.86A1.05,1.05,0,0,1,1.579,4.824H17.507A1.05,1.05,0,0,1,18.543,5.86V16.565A1.05,1.05,0,0,1,17.507,17.6Z"/>
    //       <path id="eebeecafbcda" data-name="&#x8DEF;&#x5F84; 4" class="bececcfeffbc" d="M16.515,16.349H2.572a.682.682,0,0,1-.691-.691V6.766a.682.682,0,0,1,.691-.691H16.514a.682.682,0,0,1,.691.691v8.892a.71.71,0,0,1-.691.691Z"/>
    //       <path id="bcebfbcffebff" data-name="&#x8DEF;&#x5F84; 5" class="beadacbcbace" d="M7.66,13.717h-1a.113.113,0,0,1-.1-.1V9.107a.113.113,0,0,1,.1-.1h1a.113.113,0,0,1,.1.1v4.505a.113.113,0,0,1-.1.1Zm3.719-4.61v.524l-.629,2.515c-.052.1-.21.1-.21,0L9.913,9.631V9.107a.113.113,0,0,0-.1-.1h-1a.113.113,0,0,0-.1.1v.629l1.1,4.034h1.834l1.1-4.034V9.107a.113.113,0,0,0-.1-.1h-1C11.432,8.95,11.38,9,11.38,9.107ZM3.941,12.355V9.107a.113.113,0,0,0-.1-.1h-1a.113.113,0,0,0-.1.1v4.558a.113.113,0,0,0,.1.1H5.67a.113.113,0,0,0,.1-.1V12.617a.113.113,0,0,0-.1-.1H4.15c-.157-.052-.21-.1-.21-.157Zm12.311-2.41V9.055a.113.113,0,0,0-.1-.1H13.632a.113.113,0,0,0-.1.1v4.558a.113.113,0,0,0,.1.1h2.515a.113.113,0,0,0,.1-.1v-.891a.113.113,0,0,0-.1-.1H14.89a.113.113,0,0,1-.1-.1v-.524a.113.113,0,0,1,.1-.1h1.257a.113.113,0,0,0,.1-.1v-.733a.113.113,0,0,0-.1-.1H14.89a.113.113,0,0,1-.1-.1v-.524a.113.113,0,0,1,.1-.1h1.257c.052-.1.1-.157.1-.262Z"/>
    //     </g>
    //   </g>
    // </symbol>
    // </svg>`,

    // l=(h=document.getElementsByTagName("script"))[h.length-1].getAttribute("data-injectcss");if(l&&!t.__iconfont__svg__cssinject__){t.__iconfont__svg__cssinject__=!0;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(h){console&&console.log(h)}}!function(h){if(document.addEventListener)if(~["complete","loaded","interactive"].indexOf(document.readyState))setTimeout(h,0);else{var l=function(){document.removeEventListener("DOMContentLoaded",l,!1),h()};document.addEventListener("DOMContentLoaded",l,!1)}else document.attachEvent&&(a=h,c=t.document,z=!1,(m=function(){try{c.documentElement.doScroll("left")}catch(h){return void setTimeout(m,50)}v()})(),c.onreadystatechange=function(){"complete"==c.readyState&&(c.onreadystatechange=null,v())});function v(){z||(z=!0,a())}var a,c,z,m}(function(){var h,l;(h=document.createElement("div")).innerHTML=v,v=null,(l=h.getElementsByTagName("svg")[0])&&(l.setAttribute("aria-hidden","true"),l.style.position="absolute",l.style.width=0,l.style.height=0,l.style.overflow="hidden",function(h,l){l.firstChild?function(h,l){l.parentNode.insertBefore(h,l)}(h,l.firstChild):l.appendChild(h)}(l,document.body))})}(window);

    // svgScript:
    // <Buffer 21 66 75 6e 63 74 69 6f 6e 28 74 29 7b 76 61 72 20 682c 76 3d 60 3c 73 76 67 3e 3c 73 79 6d 62 6f 6c 20 76 69 65 77 42 6f 78 3d 22 30 20 30 20 31 38 ... 3737 more bytes>

    // 生成执行 js 文件，分配新的 buffer
    const script = this.createSvgScript(spirit)
    const svgScript = Buffer.from(script)


    // fileStream:
    // Readable {
    //   _readableState: ReadableState {
    //     objectMode: false, 是否为对象模式
    //     highWaterMark: 16384,  缓冲区存放的最大字节数
    //     buffer: BufferList { head: null, tail: null, length: 0 },  缓冲区
    //     length: 0,
    //     pipes: null,
    //     pipesCount: 0,
    //     flowing: null,
    //     ended: false,
    //     endEmitted: false,
    //     reading: false,
    //     sync: true,
    //     needReadable: false,
    //     emittedReadable: false,
    //     readableListening: false,
    //     resumeScheduled: false,
    //     paused: true,
    //     emitClose: true,
    //     autoDestroy: true,
    //     destroyed: false,
    //     defaultEncoding: 'utf8',
    //     awaitDrain: 0,
    //     readingMore: false,
    //     decoder: null,
    //     encoding: null
    //   },
    //   readable: true,
    //   _read: [Function: read],
    //   _events: [Object: null prototype] {},
    //   _eventsCount: 0,
    //   _maxListeners: undefined
    // }


    // options <Object>

    // highWaterMark <number> 从底层资源读取数据并存储在内部缓冲区中的最大字节数。 默认值: 16384 (16KB), 对象模式的流默认为 16。
    // encoding <string> 如果指定了，则使用指定的字符编码将 buffer 解码成字符串。 默认值: null。
    // objectMode <boolean> 流是否可以是一个对象流。 也就是说 stream.read(n) 会返回对象而不是 Buffer。 默认值: false。
    // emitClose <boolean> 流被销毁后是否应该触发 'close'。默认值: true。
    // read <Function> 对 stream._read() 方法的实现。
    // destroy <Function> 对 stream._destroy() 方法的实现。
    // autoDestroy <boolean> 流是否应在结束后自动调用 .destroy()。默认值: true。
    
    try {
      const filename = uuidv1()
      // Readable - 可读取数据的流（例如 fs.createReadStream()）
      // stream.read 是对 readable._read() 方法的实现，在该方法中手动添加数据到 Readable 对象的读缓冲
      // 被调用时，如果从资源读取到数据，则需要开始使用 stream.push(chunk) 数据会被缓冲在可读流中，如果流的消费者没有调用 stream.read()，则数据会保留在内部队列中直到被消费。
      const fileStream = new Readable({
        autoDestroy: true,
        read () {
          // 向缓冲区推送数据
          this.push(svgScript)
          this.push(null)
        }
      })


      // 上面 跟 下面的区别
      // when you .push() to a readable stream, the chunks you push are buffered until a consumer is ready to read them.
      // To avoid buffering data altogether and only generate the data when the consumer asks for it. We can push chunks on-demand by defining a ._read function
      // 所以打印结果 fileStream 的 buffer 的 length 是 0，end 是 false，因为消费时才会 push。rs 的 buffer 的 length 是 1，end 是 true。
      const rs = bufferToReadStream(svgScript)
      const ds = bufferToDuplexStream(svgScript)
      console.log(1111111111111111, fileStream)
      console.log(2222222222222222, rs)
      console.log(3333333333333333, ds)

      const res = await this.app.ossClient.putStream(`pl-icons/${filename}.js`, fileStream)
      // const res = {
      //   name: `i-static/${filename}.js`
      // }

      // url: https://mallcdn.youpenglai.com/pl-icons/66e6a1f0-c032-11ea-871e-a1f8066f6847.js
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
   * @param url {string} js链接地址
   * @param svgs {array} svg 精灵
   * @param projectId {string} 项目id
   */
  public async saveLink (url, svgs, projectId) {

    // 根据 icon 表中当前 project 所有 svg 的 id 生成 hash
    const svgIds = svgs.map(item => item.id).join('')
    const hash = await this.generateHash(svgIds)

    const SQL = 'INSERT INTO link (id, js, hash, project_id) VALUES (?,?,?,?)'
    const id = uuidv1().replace(/\-/g, '')
    
    try {
      // 存入 redis 哈希表
      await this.app.redis.hset('svg-link', `svg-pro-id-${projectId}`, hash)
      const res = await this.app.mysql.query(SQL, [ id, url, hash, projectId ])
      return res
    } catch (e) {
      throw e
    }
  }

  private async generateHash (str): Promise<string> {
    // hash 实现了 Readable 接口，监听 readable 事件，当可读流中有数据可读取时，就会触发 'readable' 事件。 在写入 write 新的数据流，当到达流数据的尽头时， 'readable' 事件也会触发，但是在 'end' 事件之前触发。
    // 'readable' 事件表明流有新的动态：要么有新的数据，要么到达流的尽头。 对于前者，stream.read() 会返回可用的数据。 对于后者，stream.read() 会返回 null。

    // Hash {
    //   _options: undefined,
    //   writable: true,
    //   readable: true,
    //   [Symbol(kHandle)]: {},
    //   [Symbol(kState)]: { [Symbol(kFinalized)]: false }
    // }
    const hash = crypto.createHash('sha256')

    // write some data to hash
    hash.write(str)
    hash.end()

    return new Promise(resolve => {
      hash.on('readable', () => {
        // TODO: 有数据可读取，read 方法来查看加密的内容，读取已经 hash 加密的内容，返回的数据是 Buffer 对象，哈希流只会生成一个元素。
        const data = hash.read()
        if (data) {
          // TODO:
          const hashCode = data.toString('hex')
          resolve(hashCode)
        }
      })
    })
  }
  
  // TODO:
  private createSvgScript (spirit) {
    return '!function(t){var h,v=`<svg>' + spirit + '</svg>`,l=(h=document.getElementsByTagName("script"))[h.length-1].getAttribute("data-injectcss");if(l&&!t.__iconfont__svg__cssinject__){t.__iconfont__svg__cssinject__=!0;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(h){console&&console.log(h)}}!function(h){if(document.addEventListener)if(~["complete","loaded","interactive"].indexOf(document.readyState))setTimeout(h,0);else{var l=function(){document.removeEventListener("DOMContentLoaded",l,!1),h()};document.addEventListener("DOMContentLoaded",l,!1)}else document.attachEvent&&(a=h,c=t.document,z=!1,(m=function(){try{c.documentElement.doScroll("left")}catch(h){return void setTimeout(m,50)}v()})(),c.onreadystatechange=function(){"complete"==c.readyState&&(c.onreadystatechange=null,v())});function v(){z||(z=!0,a())}var a,c,z,m}(function(){var h,l;(h=document.createElement("div")).innerHTML=v,v=null,(l=h.getElementsByTagName("svg")[0])&&(l.setAttribute("aria-hidden","true"),l.style.position="absolute",l.style.width=0,l.style.height=0,l.style.overflow="hidden",function(h,l){l.firstChild?function(h,l){l.parentNode.insertBefore(h,l)}(h,l.firstChild):l.appendChild(h)}(l,document.body))})}(window);'
  }


  public test1 (svgs) {
    const svgIds = svgs.map(item => item.id).join('')

    const hash = crypto.createHash('sha256')
    hash.update(svgIds)
    // 将使用 update 进行加密的内容用十六进制的方式打印出来
    console.log('test1', hash.digest('hex'))
  }

  public test2 (svgs) {
    const svgIds = svgs.map(item => item.id).join('')
    const hash = crypto.createHash('sha256')

    return new Promise((resolve) => {
      hash.on('readable', async () => {
        const data = hash.read()
        if (data) {
          const hashCode = data.toString('hex')
          console.log('test2', hashCode)
          resolve(hashCode)
        }
      })
      hash.write(svgIds)
      hash.end()
    })
  }


}






// function (window, spirit) {
//   let h
//   let v = '<svg>' + spirit + '</svg>'
//   const injectcss = (h = document.getElementsByTagName("script"))[h.length - 1].getAttribute("data-injectcss")

//   if (injectcss && !window.__iconfont__svg__cssinject__) {
//     window.__iconfont__svg__cssinject__ = !0
//     try {
//       document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")
//     } catch (h) {
//       console && console.log(h)
//     }
//   }

//   function (h) {
//     var a, c, z, m

//     function w () {
//       z || (z = !0, a())
//     }

//     function () {
//       const div = document.createElement("div")
//       div.innerHTML = v
//       // v = null
//       const svg = div.getElementsByTagName("svg")[0]
//       if (svg) {     
//         svg.setAttribute("aria-hidden", "true")
//         svg.style.position = "absolute"
//         svg.style.width = '0'
//         svg.style.height = '0'
//         svg.style.overflow = "hidden"

//         const { firstChild } = document.body
//         firstChild && firstChild.parentNode ? firstChild.parentNode.insertBefore(svg, firstChild) : document.body.appendChild(svg)
//       }
//     }

//     if (document.addEventListener) {
//       if (~["complete", "loaded", "interactive"].indexOf(document.readyState)) {
//         setTimeout(h, 0)
//       } else { 
//         var l = function () {
//           document.removeEventListener("DOMContentLoaded", l, !1),
//           h()
//         }
//         document.addEventListener("DOMContentLoaded", l, !1)
//       }
//     } else {
//       document.attachEvent && (
//         a = h, 
//         c = window.document, 
//         z = !1, 
//         (m = function () {
//           try {
//             c.documentElement.doScroll("left")
//           } catch (h) {
//             return void setTimeout(m, 50)
//           }
//           w()
//         })(),
//         c.onreadystatechange = function () {
//           "complete" == c.readyState && (c.onreadystatechange = null, w())
//         }
//       )
//     }
//   }()
// }(window)