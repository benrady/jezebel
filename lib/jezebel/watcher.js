// Initially stolen from supervisor.js
// https://github.com/isaacs/node-supervisor

var fs = require('fs');
var utils = require('./utils');
var sys = require('util');

function watchDirectory(path, callback, watched) {
  fs.readdir(path, function(err, fileNames) {
    if(err) {
      sys.error('Error reading path: ' + path);
    }
    else {
      fileNames.forEach(function (fileName) {
        if (utils.isInProject(fileName)) {
          watchFiles(path + '/' + fileName, callback, watched);
        }
      });
    }
  });
}

function watchFileOnce(watched, path, callback) {
  if(watched.indexOf(path) == -1){
    watched.push(path)
    fs.watch(path, {persistent: true, interval: 500}, callback);
  }
}

function watchFiles(path, callback, watched) {
  watched = watched || [];
  fs.stat(path, function(err, stats){
    if (err) {
      sys.error('Error (' + err + ') retrieving stats for file: ' + path);
    }
    else {
      if (stats.isDirectory()) {
        watchDirectory(path, callback, watched);
        watchFileOnce(watched, path, function() { watchDirectory(path, callback, watched); });
      }
      else {
        if (utils.isSupportedFile(path)) {
          watchFileOnce(watched, path, function(event, filename) { callback(path); });
        }
      }
    }
  });
}

exports.watchFiles = watchFiles;

