// Basically stolen from supervisor.js, so there are no tests
// https://github.com/isaacs/node-supervisor

var fs = require('fs');
var utils = require('jezebel/utils');

function watchGivenFile (watch, callback) {
  fs.watchFile(watch, {persistent: true, interval: 500}, callback);
}

function watchFiles(path, callback) {
  var curriedCallback = function(curr, prev) {
    callback(path, curr, prev);
  };

  fs.stat(path, function(err, stats){
    if (err) {
      sys.error('Error retrieving stats for file: ' + path);
    }
    else {
      if (stats.isDirectory()) {
        fs.readdir(path, function(err, fileNames) {
          if(err) {
            sys.puts('Error reading path: ' + path);
          }
          else {
            fileNames.forEach(function (fileName) {
              if (utils.isInProject(fileName)) {
                watchFiles(path + '/' + fileName, callback);
              }
            });
          }
        });
      }
      else {
        watchGivenFile(path, curriedCallback);
      }
    }
  });
}

exports.watchFiles = watchFiles;

