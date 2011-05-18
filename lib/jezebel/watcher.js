// Initially stolen from supervisor.js
// https://github.com/isaacs/node-supervisor

var fs = require('fs');
var utils = require('jezebel/utils');
var watched = [];

function reset() {
  watched = [];
}

function watchDirectory(path, callback) {
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

function watchFileOnce(path, callback) {
  if(watched.indexOf(path) == -1){
    watched.push(path)
    fs.watchFile(path, {persistent: true, interval: 500}, callback);
  }
}

function watchFiles(path, callback) {
  fs.stat(path, function(err, stats){
    if (err) {
      sys.error('Error retrieving stats for file: ' + path);
    }
    else {
      if (stats.isDirectory()) {
        watchDirectory(path, callback);
        watchFileOnce(path, function() { watchDirectory(path, callback); });
      }
      else {
        watchFileOnce(path, function(curr, prev) { callback(path, curr, prev); });
      }
    }
  });
}

exports.watchFiles = watchFiles;
exports.reset = reset;

