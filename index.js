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

const p2a = p => chunkStr(p.replace(/[\^~-]/g,''), 3);


const arrEq = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const isTrue = b => b === true
const isFalse = b => b === false

const A = 'a'
const B = 'b'
const C = 'c'
const D = 'd'
const E = 'e'

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
    acc[key] = geonTileDefs[ast.children[0].children[0].attributes.id]
    return acc;
}, {});

const gtm = p => index[p]

const biEq = (a, b, x, y) => {
  if (a[1] === x && b[1] === y) return true
  if (a[1] === y && b[1] === x) return true
  return false
}

const symEq = (arr) => {
  return arr.every(geon => geon[0] === arr[0][0])
}

const rotEq = (arr) => {
  return arr.every(geon => geon[1] === arr[0][1])
}

const _A = {
  isReflective: {
    x: ([a, b]) => {
      if (biEq(a, b, 1, 1)) return true
      if (biEq(a, b, 2, 2)) return true
      if (biEq(a, b, 0, 3)) return true
      return false
    },
    y: ([a, b]) => {
      if (biEq(a, b, 0, 0)) return true
      if (biEq(a, b, 3, 3)) return true
      if (biEq(a, b, 1, 2)) return true
      return false
    },
  },
  isRotational: quad => {
    if (arrEq(quad, [0, 1, 2, 3])) return true
    if (arrEq(quad, [1, 2, 3, 0])) return true
    if (arrEq(quad, [2, 3, 0, 1])) return true
    if (arrEq(quad, [3, 0, 1, 2])) return true
    return false
  },
}

const _B = {
  isReflective: {
    x: ([a, b]) => {
      if (biEq(a, b, 1, 0)) return true
      if (biEq(a, b, 2, 3)) return true
      return false
    },
    y: ([a, b]) => {
      if (biEq(a, b, 3, 0)) return true
      if (biEq(a, b, 2, 1)) return true
      return false
    },
  },
  isRotational: quad => {
    if (arrEq(quad, [0, 1, 2, 3])) return true
    if (arrEq(quad, [1, 2, 3, 0])) return true
    if (arrEq(quad, [2, 3, 0, 1])) return true
    if (arrEq(quad, [3, 0, 1, 2])) return true
    return false
  },
}


const _C = {
  isReflective: {
    x: ([a, b]) => true,
    y: ([a, b]) => true,
  },
  isRotational: () => true,
}

const _D = {
  isReflective: {
    x: () => true,
    y: () => true,
  },
  isRotational: () => true,
}

const _E = {
  isReflective: {
    x: ([a, b]) => {
      if (biEq(a, b, 1, 0)) return true
      return false
    },
    y: ([a, b]) => {
      if (biEq(a, b, 1, 0)) return true
      return false
    },
  },
  isRotational: quad => {
    if (arrEq(quad, [0, 1, 2, 3])) return true
    if (arrEq(quad, [1, 2, 3, 0])) return true
    if (arrEq(quad, [2, 3, 0, 1])) return true
    if (arrEq(quad, [3, 0, 1, 2])) return true
    return false
  },
}

const isReflectiveY = tuple => {

  // Test if same symbol
  if (!symEq(tuple)) return false
  // Test each symbol type separately
  if (tuple[0][0] === A) return _A.isReflective.y(tuple)
  if (tuple[0][0] === B) return _B.isReflective.y(tuple)
  if (tuple[0][0] === C) return _C.isReflective.y(tuple)
  if (tuple[0][0] === D) return _D.isReflective.y(tuple)
  if (tuple[0][0] === E) return _E.isReflective.y(tuple)
}

const isReflectiveX = tuple => {
  // Test if same symbol
  if (!symEq(tuple)) return false
  // Test each symbol type separately
  if (tuple[0][0] === A) return _A.isReflective.x(tuple)
  if (tuple[0][0] === B) return _B.isReflective.x(tuple)
  if (tuple[0][0] === C) return _C.isReflective.x(tuple)
  if (tuple[0][0] === D) return _D.isReflective.x(tuple)
  if (tuple[0][0] === E) return _E.isReflective.x(tuple)
}

const isRotational = quad => {
  // Test if same symbol
  if (!symEq(quad)) return false
  // Test each symbol type separately
  if (quad[0][0] === A) return _A.isRotational(quad)
  if (quad[0][0] === B) return _B.isRotational(quad)
  if (quad[0][0] === C) return _C.isRotational(quad)
  if (quad[0][0] === D) return _D.isRotational(quad)
  if (quad[0][0] === E) return _E.isRotational(quad)
}

const isMonolithic = (quad) => {
  if (!symEq(quad)) return false
  // Test each symbol type separately
  if (quad[0][0] === A) return rotEq(quad)
  if (quad[0][0] === B) return rotEq(quad)
  if (quad[0][0] === C) return true
  if (quad[0][0] === D) return true
  if (quad[0][0] === E) return rotEq(quad)
  return false
}

const test = {
  reflection: {
    y: (p) => {
      const tms = p2a(p).map(gtm)
      const byCol = [[tms[0], tms[2]], [tms[1], tms[3]]]
      const res = byCol.every(isReflectiveY)
      return res
    },
    x: (p) => {
      const tms = p2a(p).map(gtm)
      const byRow = [[tms[0], tms[1]], [tms[2], tms[3]]]
      const res = byRow.every(isReflectiveX)
      return res
    }
  },
  rotation: (p) => {
    const tms = p2a(p).map(gtm)
    const res = isRotational(tms)
    return res
  },
  monolithic: (p) => {
    const tms = p2a(p).map(gtm)
    const res = isMonolithic(tms)
    return res
  }
}

const analyze = (name) => {
  console.table({
    patp: name,
    yReflection: test.reflection.y(name),
    xReflection: test.reflection.x(name),
    rotation: test.rotation(name),
    monolithic: test.monolithic(name),
  })
}


analyze('ridlur-figbud')
analyze('ridlur-satsyl')
analyze('fittyr-falref')
analyze('fittyr-falref')
analyze('rabbur-daptuc')
analyze('todten-todten')
analyze('fasren-dasten')
