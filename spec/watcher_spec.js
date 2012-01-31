describe('watcher', function() {
  var watcher, fs, sys;

  beforeEach(function() {
    watcher = require('jezebel/watcher');
    fs = require('fs');
    spyOn(fs, 'watch');
    spyOn(fs, 'unwatchFile');
    spyOn(fs, 'stat');
    spyOn(fs, 'readdir');
    sys = require('util');
    spyOn(sys, 'error');
  });

  describe('watching a single file', function() {
    var callback;
    beforeEach(function() {
      callback = jasmine.createSpy('callback');
      watcher.watchFiles('filename.js', callback);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});
    });

    it('provides the correct filename and options to watch', function() {
      expect(fs.watch.argsForCall[0][0]).toEqual('filename.js');
      expect(fs.watch.argsForCall[0][1]).toEqual({persistent : true, interval : 500});
    });

    it('curries filename to the callback of watch', function() {
      fs.watch.invokeCallback();
      expect(callback).toHaveBeenCalledWith('filename.js');
    });
  });

  describe('watching a directory', function() {
    beforeEach(function() {
      watcher.watchFiles('dirName', function() {});
      fs.stat.invokeCallback('', {isDirectory : function(){return true;}});
    });

    it('calls watch on dir and all files in the dir', function() {
      fs.readdir.invokeCallback('', ['file0.js', 'file1.coffee']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watch.callCount).toEqual(3);
      expect(fs.watch.argsForCall[0][0]).toEqual('dirName');
      expect(fs.watch.argsForCall[1][0]).toEqual('dirName/file0.js');
      expect(fs.watch.argsForCall[2][0]).toEqual('dirName/file1.coffee');
    });

    it('detects new files and watches those', function() {
      fs.readdir.reset();
      fs.watch.invokeCallback('');

      fs.readdir.invokeCallback('', ['file0.js']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watch.callCount).toEqual(1);
      expect(fs.watch.argsForCall[0][0]).toEqual('dirName/file0.js');
    });
  });

  it('ignores non-supported files', function() {
      fs.readdir.invokeCallback('', ['file0']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watch.callCount).toEqual(0);
  });

  it('only watches a file once', function() {
    watcher.watchFiles('dirName', function() {});
    fs.stat.invokeCallback('', {isDirectory : function(){return true;}});
    var dirChanged = fs.watch.argsForCall[0][2];
    fs.readdir.invokeCallback('', ['file0.js']);

    dirChanged();
    fs.readdir.invokeCallback('', ['file0.js']);
    fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

    expect(fs.watch.callCount).toEqual(2);
    expect(fs.watch.argsForCall[0][0]).toEqual('dirName');
    expect(fs.watch.argsForCall[1][0]).toEqual('dirName/file0.js');
  });

  it('writes errors to sys.error', function() {
    watcher.watchFiles('dirName', function() {});
    fs.stat.invokeCallback(true);
    expect(sys.error).toHaveBeenCalled();
  });
});
