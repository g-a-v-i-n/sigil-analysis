const fs = require('fs')

const str = fs.readFileSync(__dirname + '/data/monrel.txt', 'utf8');

const a = str.replace(/(?:\r\n|\r|\n)/g, `",`)
const b = a.replace(/~/g, `"~`)

const res = 'const monrel = [' + b + `"]; export default monrel;`

fs.writeFileSync(__dirname + '/data/monrel.js', res);
