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
      watcher.watchFiles('filename', callback);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});
    });

    it('provides the correct filename and options to watch', function() {
      expect(fs.watch.argsForCall[0][0]).toEqual('filename');
      expect(fs.watch.argsForCall[0][1]).toEqual({persistent : true, interval : 500});
    });

    it('curries filename to the callback of watch', function() {
      fs.watch.invokeCallback();
      expect(callback).toHaveBeenCalledWith('filename');
    });
  });

  describe('watching a directory', function() {
    beforeEach(function() {
      watcher.watchFiles('dirName', function() {});
      fs.stat.invokeCallback('', {isDirectory : function(){return true;}});
    });

    it('calls watch on dir and all files in the dir', function() {
      fs.readdir.invokeCallback('', ['file0', 'file1']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watch.callCount).toEqual(3);
      expect(fs.watch.argsForCall[0][0]).toEqual('dirName');
      expect(fs.watch.argsForCall[1][0]).toEqual('dirName/file0');
      expect(fs.watch.argsForCall[2][0]).toEqual('dirName/file1');
    });

    it('detects new files and watches those', function() {
      fs.readdir.reset();
      fs.watch.invokeCallback('');

      fs.readdir.invokeCallback('', ['file0']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watch.callCount).toEqual(1);
      expect(fs.watch.argsForCall[0][0]).toEqual('dirName/file0');
    });
  });

  it('only watches a file once', function() {
    watcher.watchFiles('dirName', function() {});
    fs.stat.invokeCallback('', {isDirectory : function(){return true;}});
    var dirChanged = fs.watch.argsForCall[0][2];
    fs.readdir.invokeCallback('', ['file0']);

    dirChanged();
    fs.readdir.invokeCallback('', ['file0']);
    fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

    expect(fs.watch.callCount).toEqual(2);
    expect(fs.watch.argsForCall[0][0]).toEqual('dirName');
    expect(fs.watch.argsForCall[1][0]).toEqual('dirName/file0');
  });

  it('writes errors to sys.error', function() {
    watcher.watchFiles('dirName', function() {});
    fs.stat.invokeCallback(true);
    expect(sys.error).toHaveBeenCalled();
  });
});
