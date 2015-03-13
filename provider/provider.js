var provider ={
  gateway: null,

  register: function(obj){
    var self=this;

    if (this.hasMethods(obj,'handleSMS')){
      self.gateway=obj;
      return true;
    }
    return false;
  },

  hasMethods: function(obj){
    var i = 1, methodName;
    while((methodName = arguments[i++])){
        if(typeof obj[methodName] != 'function') {
            return false;
        }
    }
    return true;
  },

  getProvider: function(){
    return this.gateway;
  }

};



module.exports=provider;
