var path = require('path');
var fs = require('fs');

function isInProject(path) {
  return exports.ignoredFiles.indexOf(path.toLowerCase()) === -1;
}

function projectFiles(pattern, path) {
  pattern = pattern || /.*\.js$/;
  path = path || process.cwd();
  var files = [];
  if (fs.statSync(path).isDirectory()) {
    fs.readdirSync(path).forEach(function (fileName) {
      if (isInProject(fileName)) {
        files = files.concat(projectFiles(pattern, path + '/' + fileName));
      }
    });
  } else {
    if (path.match(pattern)) { 
      files.push(path); 
    }
  }
  return files;
}

exports.ignoredFiles = ['.git', 'node_modules'];
exports.projectFiles = projectFiles;
exports.isInProject = isInProject;

