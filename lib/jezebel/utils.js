var path = require('path');
var fs = require('fs');

function isInProject(path) {
  return exports.ignoredFiles.indexOf(path.toLowerCase()) === -1;
}

function isSupportedFile(path) {
  var javascriptPattern = /.*\.js$/;
  var coffeescriptPattern = /.*\.coffee$/;
  return path.match(javascriptPattern) || path.match(coffeescriptPattern);
}

exports.ignoredFiles = ['.git', 'node_modules'];
exports.isInProject = isInProject;
exports.isSupportedFile = isSupportedFile;

