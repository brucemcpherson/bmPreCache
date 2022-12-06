/**
 * mainly we'll have Apps Script specific utilities stuff in here to make it easier to migrate to another package
 */
const Utils = (() => {

  const isNull = (value) => value === null
  const isNU = (value) => isNull(value) || isUndefined(value)
  const isUndefined = (value) => typeof value === typeof undefined

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
  return {
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
    trunk
  }
})()



