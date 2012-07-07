describe('jezebel', function() {
  var childProcess = require('child_process'),
      sys = require('util');
  var watcher, jezebel, repl, session, settings; 

  beforeEach(function() {
    watcher = require('jezebel/watcher');
    jezebel = require('jezebel');
    session = {context: {}}; 
    spyOn(jezebel.repl, 'start').andReturn(session);
    spyOn(watcher, 'watchFiles');
    spyOn(childProcess, 'spawn');
    spyOn(process.stdin, 'emit');
    spyOn(process, 'nextTick');
    spyOn(require('fs'), 'exists').andCallFake(function(file, callback) {
      if(file == process.cwd() + '/.jezebel')
        callback(true);
      else
        callback(false);
    });
    require(process.cwd() + '/.jezebel').settings = settings = {};
  });

  function rootDir() {
    var path = require('path')
    var fs = require('fs');
    return fs.realpathSync(path.dirname(fs.realpathSync(__filename)) + '/..');
  }

  function expectReplEval(statement) {
    expect(process.stdin.emit).toHaveBeenCalled();
    expect(process.stdin.emit.argsForCall[0][0]).toEqual('data');
    expect(process.stdin.emit.argsForCall[0][1].toString()).toEqual(statement);
  }

  describe('run', function() {
    beforeEach(function() {
      childProcess.spawn.andReturn(process);
    });

    it('watches for all the files in the specified directory', function() {
      jezebel.run([], {});
      expect(watcher.watchFiles).toHaveBeenCalledWith(process.cwd(), jezebel.fileChanged);
    });

    it('stars the repl', function() {
      jezebel.run([], {});
      expect(jezebel.repl.start).toHaveBeenCalledWith('> ');
    });

    it('calls the onStart hook', function() {
      settings.onStart = jasmine.createSpy('onStart');
      jezebel.run([], {});
      expect(settings.onStart).toHaveBeenCalled();
    });
  });

  describe('fileChanged', function() {
    beforeEach(function() {
      spyOn(console, 'log');
      childProcess.spawn.andReturn(process);
    });

    it('runs tests if the file has changed', function() {
      jezebel.fileChanged(__filename, {mtime: new Date(100)}, {mtime: new Date(0)});
      expect(childProcess.spawn).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Running examples in spec/jezebel_spec.js');
    });

    it('does not run the tests if the file has not actually changed', function() {
      jezebel.fileChanged("", {mtime: new Date(0)}, {mtime: new Date(0)});
      expect(process.stdin.emit).not.toHaveBeenCalled();
    });

    it('invokes the onChange hook to determine the tests to run', function() {
      jezebel.settings.onChange = function() {
        return ['myspecs'];
      };
      jezebel.fileChanged(__filename, {mtime: new Date(100)}, {mtime: new Date(0)});
      expect(childProcess.spawn.argsForCall[0][1]).toEqual(['myspecs']);
    });
  });

  describe('runTests', function() {
    var child;

    beforeEach(function() {
      childProcess.spawn.andReturn(child = {
        stdout: jasmine.createSpyObj('stdout', ['addListener']),
        stderr: jasmine.createSpyObj('stderr', ['addListener']),
        on: jasmine.createSpy('on')
      });
    });

    it('runs all tests in the spec directory by default', function() {
      jezebel.runTests();
      expect(childProcess.spawn).toHaveBeenCalledWith(rootDir() + '/node_modules/jessie/bin/jessie', ['spec']);
    });

    it('runs the specified tests', function() {
      jezebel.runTests(['spec']);
      expect(childProcess.spawn).toHaveBeenCalledWith(rootDir() + '/node_modules/jessie/bin/jessie', ['spec']);
    });

    it('writes stdout to sys.print', function() {
      spyOn(sys, 'print');
      jezebel.runTests(['spec']);
      child.stdout.addListener.argsForCall[0][1]('hello');
      expect(sys.print).toHaveBeenCalledWith('hello');
    });

    it('writes stderr to sys.debug', function() {
      spyOn(sys, 'debug');
      jezebel.runTests(['spec']);
      child.stderr.addListener.argsForCall[0][1]('goodbye');
      expect(sys.debug).toHaveBeenCalledWith('goodbye');
    });

    it('adds a line feed after running to re-prompt the repl', function() {
      jezebel.runTests(['spec']);
      child.on.argsForCall[0][1]();
      expect(process.nextTick).toHaveBeenCalled();
    });
  });

  describe('returnInRepl', function() {
    it('sets the argument as the return value', function() {
      returnInRepl('foo');
      pending();
      expect(session.context._).toEqual('foo');
    });

    it('evaluates the return value on the next tick', function() {
      returnInRepl('foo');
      process.nextTick.argsForCall[0][0]();
      expectReplEval("_\n");
    });
    
  });
});

