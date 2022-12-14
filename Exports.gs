var Exports = {

  get validateProperties () {
    return {
      get(target, prop, receiver) {
        if (!Reflect.has(target, prop)) throw `attempt to get property ${prop} that doesn't exist`
        return Reflect.get(target, prop, receiver)
      },

      set(target, prop, value, receiver) {
        if (!Reflect.has(target, prop)) throw `attempt to set property ${prop} that doesn't exist`
        return Reflect.set(target, prop, value, receiver)
      }
    }
  },
  /**
   * Store class
   * @implements {Store} 
   */
  get Store() {
    return Store
  },

  /**
   * Store instance with validation
   * @param {...*} args
   * @return {Store} a proxied instance of store with property checking enabled
   */
  newStore (...args) {
    return new Proxy (new this.Store(...args), this.validateProperties)
  },
  /**
   * Cacher class
   * @implements {Cacher} 
   */
  get Cacher() {
    return Cacher
  },

  /**
   * PreCache class
   * @implements {PreCache} 
   */
  get PreCache() {
    return PreCache
  },

  /**
   * Compress namespace
   * @implements {Compress} 
   */
  get Compress() {
    return Compress
  },

  /**
   * Utils namespace
   * @implements {Utils} 
   */
  get Utils() {
    return Utils
  },
  
  /**
   * Unit Class 
   * @implements {bmUnitTester.Unit} 
   */
  get Unit() {
    return bmUnitTester.Unit
  },

}


