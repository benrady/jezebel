var fs = require('fs');
var path = require('path');
var binDir = path.dirname(fs.realpathSync(__filename));
var lib  = path.join(binDir, '../lib');
require.paths.push(lib);
