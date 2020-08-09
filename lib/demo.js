const cheerio = require('cheerio')
const uuidv4 = require('uuid/v4')
let svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs>
    <style>
      .cls-1 {
        fill: #f2b036;
      }
    </style>
  </defs>
  <path id="添加" class="cls-1" d="M8,14.666A6.666,6.666,0,1,0,1.334,8,6.666,6.666,0,0,0,8,14.666ZM8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM7.111,7.111V5.334a.889.889,0,1,1,1.778,0V7.111h1.778a.889.889,0,1,1,0,1.778H8.889v1.778a.889.889,0,1,1-1.778,0V8.889H5.334a.889.889,0,1,1,0-1.778H7.111Z" transform="translate(0)"/>
</svg>`

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
console.log(svg)

