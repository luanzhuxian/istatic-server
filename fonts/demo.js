// const SVGIcons2SVGFontStream = require('svgicons2svgfont')
// const svg2ttf = require('svg2ttf')
// const ttf2woff = require('ttf2woff')
// const ttf2woff2 = require('ttf2woff2')
// const ttf2eot = require('ttf2eot')
// const fs = require('fs')
//
// const svgfont = fs.readFileSync('yaji.svg', 'utf8')
// const ttf = svg2ttf(svgfont, {})
// fs.writeFileSync('yaji.ttf', Buffer.from(ttf.buffer))
// const input = fs.readFileSync('yaji.ttf')
// const ttfArr = new Uint8Array(input)
// const woff = Buffer.from(ttf2woff(ttfArr).buffer)
// const woff2 = Buffer.from(ttf2woff2(ttfArr).buffer)
// const eot = Buffer.from(ttf2eot(ttfArr).buffer)
// fs.writeFileSync('yaji.woff', woff)
// fs.writeFileSync('yaji.woff2', woff2)
// fs.writeFileSync('yaji.eot', eot)
//
const webfontsGenerator = require('../lib/webfonts-generator/src')
webfontsGenerator({
    files: [
        'icon-bold.svg',
        'icon-center.svg'
    ],
    codepoints: [0xF101, 0xF333],
    fontName: 'yaji',
    dest: 'dest/',
    types: ['svg', 'ttf', 'woff', 'woff2', 'eot'],
    order: ['eot', 'woff2', 'woff', 'ttf', 'svg'],
    writeFiles: true
}, function(error, res) {
    if (error) {
        console.log('Fail!', error);
    } else {
        console.log(res)
        console.log('Done!');
    }
})
