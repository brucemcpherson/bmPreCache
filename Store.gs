/**
 * @Class Store
 * GWAO uses property store a lot to persist values through instantiation
 * this class provides a simpel interface for that
 */

class Store {
  /**
   * @constructor
   * @param {PropertiesStore} store the store to use
   * @param {number} [evictAfter = 30000] store memory cache eviction after this time
   * @param {number} [maxLength = 100000] max bytes to hold in memory cache
   * @return {Store} 
   */
  constructor({store,log= false, evictAfter = 60000, maxLength = 5000000} = {}) {
    // there is a small memory cache to store stuff in to avoid going to cache/props every time
    this.store = store
    if (!this.store) throw 'please supply a property store parameter to the Store constructor'
    this.log = log
    if (maxLength) this.preCache = new Exports.PreCache ({evictAfter, log , maxLength})
  }



  report () {
    return this.preCache ? this.preCache.report() : null
  }
  
  /**
   * to make stuff in property store more versatile we'll convert it to an object and stringify it
   * @param {*} ob
   * @return string
   */
  stringify(ob) {
    return Exports.Utils.isNU(ob) ? null: JSON.stringify({
      ob 
    })
  }

  /**
   * to make stuff in property store more versatile we'll convert it to an object and stringify it
   * this undoes that
   * @param {string} value the value from store
   * @return {*}
   */
  unstringify(value) {
    if (Exports.Utils.isNU(value)) return null
    try {
      const {ob} = JSON.parse(value)
      return typeof ob === typeof undefined ? value: ob
    }
    catch (err) {
      return value
    }
  }


  _remove (key) {
    if (this.preCache) this.preCache.remove(key)
    this.store.deleteProperty(key)
  }
  /**
    * put to property store
    * @param {string} key store agains this key
    * @param {*} value thing to write
    */
  set (key, value) {
    const k = key
    if (this.log) console.log('storelog','setting',k, value)
    const payload = this.stringify(value)
    if (!payload) {
      this._remove(k)
      return value
    } else {
      if (this.preCache) this.preCache.set(key, payload)
      this.store.setProperty(k, payload)
      return value
    }
    
  }

  /**
   * @param {string} key stored agains this key
   * @return {string} the value
   */
  get (key) {
    const k = key
    let cc = this.preCache && this.preCache.get(k)
    // it was in preCache
    const inPre = cc && cc.value
    // take the value from pecache, or get it from store
    const value = inPre || this.unstringify(this.store.getProperty(k))
    // if it wasnt in precache, so set it in precache
    if (this.preCache && !cc && value) this.preCache.set(key, value)
    if (this.log) console.log('storelog','getting',k, value, 'cc',cc,  !Utils.isNull(cc))
    return value
  } 

  /**
   * @param {string} key stored agains this key
   */
  delete(key) {
    const k = key
    if (this.log) console.log('storelog','removing',k)
    this._remove(k)
    return null
  } 
}
