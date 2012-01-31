var fs = require('fs');
var path = require('path');

jasmine.Spy.prototype.invokeCallback = function(){
  var argsToInvokeWith = arguments;
  this.argsForCall.forEach(function(args){
    args[args.length -1].apply(this, argsToInvokeWith);
  });
  this.reset();
};
