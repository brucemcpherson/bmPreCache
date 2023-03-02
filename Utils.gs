/**
 * mainly we'll have Apps Script specific utilities stuff in here to make it easier to migrate to another package
 */

const Utils = (() => {

  const isNull = (value) => value === null
  const isNU = (value) => isNull(value) || isUndefined(value)
  const isUndefined = (value) => typeof value === typeof undefined

  const singleSlash = (url) => {
    const s = url.replace(/\/+/g, '/')
    return s === '/' ? '' : s
  }

  /**
   * color manip = required to decide whether to use a light or dark font given a background
   * adapted from https://24ways.org/2010/calculating-color-contrast/
   */
  const getContrast = (color) => {
    const { r, g, b } = getRgb(color)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128 ? '#212121' : '#ffffff'
  }

  /**
   * create a key from arbitrary args
   * @param {...*} var_args
   * return {string}
   */
  digester = (...args) => {
    // conver args to an array and digest them
    const t = args.map(function (d) {
      if (typeof d === typeof undefined) throw new Error('digester key component cant be undefined')
      return (Object(d) === d) ? JSON.stringify(d) : d.toString();
    }).join("-")
    const s = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, t, Utilities.Charset.UTF_8)
    return Utilities.base64EncodeWebSafe(s)
  }

  // assume color is #hhhhhh
  const getRgb = (color) => ({
    r: parseInt(color.substr(1, 2), 16),
    g: parseInt(color.substr(3, 2), 16),
    b: parseInt(color.substr(5, 2), 16)
  })


  const isDate = (text) => {
    const date = new Date(text);
    return date instanceof Date && !isNaN(date.valueOf())
  }
  /**
   * convert an array of bytes to a hex string
   *  @param {Array.byte} bytes the byte array to convert
   * @return {string} the hex encoded string
  */
  const byteToHexString = (bytes) => {
    return bytes.reduce(function (p, c) {
      return p += padLeading((c < 0 ? c + 256 : c).toString(16), 2);
    }, '');
  }
  /**
  * pad leading part of string
  * @param {string} stringtoPad the source string
  * @param {number} targetLength what the final string length should be
  * @param {string} padWith optional what to pad with - default "0"
  * @return {string} the padded string
  */
  const padLeading = (stringtoPad, targetLength, padWith) => {
    return (stringtoPad.length < targetLength
      ? Array(1 + targetLength - stringtoPad.length).join(padWith | "0")
      : "") + stringtoPad;
  }

  /**
   *
   * @param {string} str b64 string to decompress
   * @return {object} original object
   */
  const decompress = (str) => {
    return JSON.parse(Utilities.unzip(Utilities.newBlob(Utilities.base64Decode(str), 'application/zip'))[0].getDataAsString())
  }
  const percent = (value, base, places = 1) => {
    return base ? (100 * value / base).toFixed(places) : base.toFixed(places)
  }

  const trunk = (str, maxLength = 100) => {
    if (typeof str === 'string') {
      return (str.length > maxLength) ? str.slice(0, maxLength) + '...' : str;
    }
    return str
  };
  /**
   *
   * @param {object} obj b64 to compress
   * @return {string} compressed string
   */
  const compress = (obj) =>
    Utilities.base64Encode(Utilities.zip([Utilities.newBlob(JSON.stringify(obj))]).getBytes())

  const bytesToHex = (bytes) => bytes.map(b=> ('0' + (b & 0xFF).toString(16)).slice(-2)).join('')
  const b64ToHex = (b64) => bytesToHex(Utilities.base64Decode(b64, Utilities.Charset.UTF_8))
  const blobToB64 = (blob) => Utilities.base64Encode(blob.getBytes())
  const b64ToBlob = (b64, contentType, name) =>
    Utilities.newBlob(Utilities.base64Decode(b64, Utilities.Charset.UTF_8), contentType, name)
  const newBlob = (content, contentType, name) => Utilities.newBlob(content, contentType, name)
  const toBytes = (text) => Utilities.newBlob(text).getBytes()
  const uuid = () => Utilities.getUuid()
  const blobToCache = (blob) => ({
    b64: blobToB64(blob),
    contentType: blob.getContentType(),
    name: blob.getName(),
  })
  const cacheToBlob = ({ b64, contentType, name }) => b64ToBlob(b64, contentType, name)
  const cacheBlob = (blob) => compress(blobToCache(blob))
  const unCacheBlob = (cache) => cacheToBlob(decompress(cache))
  const blobToObject = (blob) => JSON.parse(blob.getDataAsString())
  const explodeParams = (params) => {
    return Array.from(params.flat(Infinity).reduce((p, c) => {

      Object.keys(c).forEach(k => {
        let value = c[k]
        if (typeof c[k] === 'object') {
          // its possible we have something like this
          // { filter: {type:'aa', x: 'y'}} 
          value = Object.keys(c[k]).reduce ((p,o)=> {
            p.push(o + '=' + c[k][o])
            return p
          },[]).join (" AND ")
        }
        p.push([k, encoder(value)])
      })
      return p
    }, [])
      .reverse()
      .reduce((p, c) => {
        p.set(c[0], c[1])
        return p
      }, new Map())).sort((a, b) => {
        if (a[0] === b[0]) return 0
        if (a[0] > b[0]) return 1
        return -1
      })
  }

  const addParams = (params) => {
    params = arrify(params).flat(Infinity)
    const pars = explodeParams(params).map(f => f.join("="))
    return pars.length ? `?${pars.join('&')}` : ''
  }

  const arrify = (item) => Array.isArray(item) ? item : (isNU(item) ? [] : [item])

  const encoder = (str) => {
    return encodeURIComponent(str)
  }

  const isObject = (obj) => obj === Object(obj);
  const isBlob = (blob) => isObject(blob) && blob.toString() === 'Blob'
  const isArray = (item) => Array.isArray(item)
  const isByteArray = (item) => isArray(item) && !isUndefined(item.byteLength)
  const isNumber = (item) => typeof item === "number"
  const isBoolean = (item) => typeof item === "boolean"
  const isString = (item) => typeof item === "string"

  return {
    blobToObject,
    arrify,
    addParams,
    isDate,
    blobToB64,
    uuid,
    boundary: uuid,
    toBytes,
    md5: (blob) => byteToHexString(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, blob.getBytes())),
    sleep: (ms) => Utilities.sleep(ms),
    isHttpOk: (code) => Math.floor(code / 100) === 2,
    newBlob,
    b64ToBlob,
    blobToCache,
    compress,
    decompress,
    cacheBlob,
    unCacheBlob,
    dedup: (items, key) => Array.from(new Map(items.map(f => [f[key], f])).values()),
    isUndefined,
    isNull,
    isNU,
    percent,
    trunk,
    getContrast,
    singleSlash,
    encoder,
    digester,
    b64ToHex,
    isBlob,
    isNumber,
    isByteArray,
    isBoolean,
    isString,
    isArray
  }
})()


