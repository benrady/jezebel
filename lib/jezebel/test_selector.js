exports.select = function(path, curr, prev) {
  if (path.match(/\_spec.(js|coffee)$/)) {
    return [path.replace(process.cwd() + '/', '')];
  }
  if (path.match(/\.(js|coffee)$/)) {
    return ['spec'];
  }
}
