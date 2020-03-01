const fs = require('fs');
const path = require('path');
const svgson = require('svgson')
const del = require('del')

const INPUT_PATH = __dirname + '/svg/';

const pretty = j => JSON.stringify(j, null, ' ');

const chunkStr = (str, size) => {
  const r = new RegExp(`.{1,${size}}`, 'g');
  return str.match(r);
}

const p2a = p => chunkStr(p.replace(/[\^~-]/g,''), 3)

const isTrue = b => b === true
const isFalse = b => b === false

const A = 'a'
const B = 'b'
const C = 'c'
const D = 'd'
const e = 'e'
const any = [a, b, c, e]




const fourSided = [a, b]
const twoSided = [e]
const singleSided = [c, d]

const anyOf = x => any.includes(x)

// index 0 [a, b, c, d, e]: key for each shape
// index 1 [0, 1, 2, 3]: rotation count
// index 2 [0, 1, 2] symmetry class
// // index 3 [1, 2, 4] number of possible rotations
// Few of these are actually labelled correctly, so we normalize here.
const geonTileDefs = {
  _thumb0:   [A, 0, 1, 4],
  _thumb90:  [A, 2, 1, 4],
  _thumb180: [A, 3, 1, 4],
  _thumb270: [A, 1, 1, 4],
  _wedge0:   [B, 0, 0, 4],
  _wedge90:  [B, 1, 0, 4],
  _wedge180: [B, 2, 0, 4],
  _wedge270: [B, 3, 0, 4],
  _disc:     [C, 0, 2, 1],
  _square:   [D, 0, 2, 1],
  _leaf0:    [E, 0, 0, 2],
  _leaf180:  [E, 1, 0, 2], // leaf180 is actually 90 deg rotated
}


const index = fs
  .readdirSync(INPUT_PATH)
  .filter(filename => path.extname(filename).toLowerCase() === '.svg')
  .reduce((acc, filename) => {
    const content = fs.readFileSync(INPUT_PATH + filename, 'utf8');
    const key = path.basename(filename, '.svg');
    const ast = svgson.parseSync(content)
    // console.log(pretty(ast))
    acc[key] = geonTileDefs[ast.children[0].children[0].attributes.id]
    return acc;
}, {});

const gtm = p => index[p]



const a = {
  isReflectiveH: ([a, b]) => {
    if (a[1] === 0 && b[1] === 1) return true
    if (a[1] === 1 && b[1] === 0) return true
    if (a[1] === 2 && b[1] === 3) return true
    if (a[1] === 3 && b[1] === 2) return true
    return false
  },
  isReflectiveV: ([a, b]) => {
    if (a[1] === 0 && b[1] === 3) return true
    if (a[1] === 3 && b[1] === 0) return true
    if (a[1] === 2 && b[1] === 1) return true
    if (a[1] === 1 && b[1] === 2) return true
    return false
  },
}


const isReflectiveV = set => {
  const [a, b] = set
  // test if same symbol
  if (a[0] !== b[0]) return false
  if (a[0] === 4) {
    if (a[1] === 0 && b[1] === 3) return true
    if (a[1] === 3 && b[1] === 0) return true
    if (a[1] === 2 && b[1] === 1) return true
    if (a[1] === 1 && b[1] === 2) return true
  }
  if (a[3] === 2) {
    if (a[1] === 0 && b[1] === 1) return true
    if (a[1] === 1 && b[1] === 0) return true
  }
  if (a[3] === 1) return true
  return false
}

const isReflectiveH = set => {
  const [a, b] = set
  // test if same symbol
  if (a[0] !== b[0]) return false
  if (a[3] === 4) {
    if (a[1] === 0 && b[1] === 1) return true
    if (a[1] === 1 && b[1] === 0) return true
    if (a[1] === 2 && b[1] === 3) return true
    if (a[1] === 3 && b[1] === 2) return true
  }
  if (a[3] === 2) {
    if (a[1] === 0 && b[1] === 1) return true
    if (a[1] === 1 && b[1] === 0) return true
  }
  if (a[3] === 1) return true
  return false
}

const test = {
  reflection: {
    vertical: (p) => {
      const tms = p2a(p).map(gtm)
      const byCol = [[tms[0], tms[2]], [tms[1], tms[3]]]
      const res = byCol.every(isReflectiveV)
      return res
    },
    horizontal: (p) => {
      const tms = p2a(p).map(gtm)
      const byRow = [[tms[0], tms[1]], [tms[2], tms[3]]]
      const res = byRow.every(isReflectiveH)
      return res
    }
  }
}

console.log(
  test.reflection.vertical('ridlur-figbud'), // false
  test.reflection.horizontal('ridlur-figbud') // false
)

console.log(
  test.reflection.vertical('ridlur-satsyl'), // false
  test.reflection.horizontal('ridlur-satsyl') // false
)

console.log(
  test.reflection.vertical('donbec-satsyl'), // true
  test.reflection.horizontal('donbec-satsyl') // true
)

console.log(
  test.reflection.vertical('~fittyr-falref'), // true
  test.reflection.horizontal('~fittyr-falref') // true
)
//~rabbur-daptuc
console.log(
  test.symmetry.vertical('~rabbur-daptuc'), // true
  test.symmetry.horizontal('~rabbur-daptuc') // false
)
