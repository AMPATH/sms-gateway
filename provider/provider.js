var provider ={
  gateway: null,


  /**
   * register - register a provider
   *
   * @param  {type} obj provider object
   */   
  register: function(obj){
    var self=this;

    if (this.hasMethods(obj,'handleSMS','isSupportCallback','processCallback')){
      self.gateway=obj;
      return true;
    }
    return false;
  },


  /**
   * hasMethods - checks if this provider supports the methods provided as args
   *
   * @param  {object} obj provider
   * @return {boolean}
   */
  hasMethods: function(obj){
    var i = 1, methodName;
    while((methodName = arguments[i++])){
        if(typeof obj[methodName] != 'function') {
            return false;
        }
    }
    return true;
  },


  /**
   * getProvider - returns the provider
   *
   * @return {object}  provider
   */
  getProvider: function(){
    return this.gateway;
  }

};



module.exports=provider;
