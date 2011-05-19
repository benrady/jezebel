var fs = require('fs');
var path = require('path');
var binDir = path.dirname(fs.realpathSync(__filename));
var lib  = path.join(binDir, '../lib');
require.paths.push(lib);

jasmine.Spy.prototype.invokeCallback = function(){
  var argsToInvokeWith = arguments;
  this.argsForCall.forEach(function(args){
    args[args.length -1].apply(this, argsToInvokeWith);
  });
  this.reset();
};
