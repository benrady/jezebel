var fs = require('fs'),
    path = require('path'),
    watcher = require('jezebel/watcher'),
    repl = require('repl'),
    childProcess = require('child_process'),
    sys = require('sys');
var rootDir = fs.realpathSync(path.dirname(__filename) + '/..');
var selector = require('jezebel/test_selector');

var session;
var settings = {};

function evalInRepl(statement) {
  // FIXME Really would be cool if we could emit an escape or something to clear the current command (if any)
  process.stdin.emit('data', new Buffer(statement));
}

function returnInRepl(arg) {
  session.context._ = arg;
  process.nextTick(function() {
    evalInRepl('_\n');
  });
}

function runHook(name, args) {
  func = settings["on" + name];
  if (func) {
    return func.apply(session.context, args);
  } 
}

function fileChanged(path, curr, prev) {
  if (curr.mtime.getTime() !== prev.mtime.getTime()) {
    var tests = runHook('Change', [path, curr, prev]) || selector.select(path, curr, prev);
    if (tests) {
      console.log("Running examples in " + tests.join(' '));
      runTests(tests);
    }
  }
}

function runTests(tests) {
  tests = tests || ['spec'];
  var child  = childProcess.spawn(rootDir + '/node_modules/jessie/bin/jessie', tests);
  child.stdout.addListener("data", function (chunk) { chunk && sys.print(chunk) });
  child.stderr.addListener("data", function (chunk) { chunk && sys.debug(chunk) });
  child.on('exit', function(fail) { 
    if (fail) {
      runHook('Fail');
    } else {
      runHook('Pass');
    }
    returnInRepl(!fail);
  });
}

function loadConfig(callback) {
  var configFile = process.cwd() + '/.jezebel';
  path.exists(configFile, function(exists) {
    if (exists) { 
      config = require(configFile); 
      extend(session.context, config);
      extend(settings, config.settings);
    }
    callback();
  });
}

function extend(obj1, obj2) {
  for(i in obj2) {
    obj1[i] = obj2[i];
  }
}

function startRepl() {
  session = repl.start("> ");
  session.context.runTests = runTests;
}

// FIXME Hackity, hack, hack. For some reason, this module is not cached. Spying on a copy won't work.
exports.repl = repl;

exports.runTests = runTests;
exports.fileChanged = fileChanged;
exports.loadConfig = loadConfig;
exports.settings = settings

global.returnInRepl = returnInRepl;

exports.run = function(args, options) {
  watcher.watchFiles(process.cwd(), fileChanged);
  startRepl();
  loadConfig(function() {
    runHook('Start', [session]);
    runTests(['spec']);
  });
};
