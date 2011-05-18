describe('watcher', function() {
  var watcher, fs;

  beforeEach(function() {
    watcher = require('jezebel/watcher');
    watcher.reset();
    fs = require('fs');
    spyOn(fs, 'watchFile');
    spyOn(fs, 'unwatchFile');
    spyOn(fs, 'stat');
  });

  describe('watching a single file', function() {
    var callback;
    beforeEach(function() {
      callback = jasmine.createSpy('callback');
      watcher.watchFiles('filename', callback);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});
    });

    it('provides the correct filename and options to watchFile', function() {
      expect(fs.watchFile.argsForCall[0][0]).toEqual('filename');
      expect(fs.watchFile.argsForCall[0][1]).toEqual({persistent : true, interval : 500});
    });

    it('curries filename to the callback of watchFile', function() {
      fs.watchFile.invokeCallback('curr', 'prev');
      expect(callback).toHaveBeenCalledWith('filename', 'curr' , 'prev');
    });

    it('only watches a file once', function() {
      watcher.watchFiles('filename', callback);
      watcher.watchFiles('filename', callback);
      expect(fs.watchFile.callCount).toEqual(1);
    });
  });

  describe('watching a directory', function() {
    beforeEach(function() {
      spyOn(fs, 'readdir');
      watcher.watchFiles('dirName', function() {});
      fs.stat.invokeCallback('', {isDirectory : function(){return true;}});
    });

    it('calls watchFile on dir and all files in the dir', function() {
      fs.readdir.invokeCallback('', ['file0', 'file1']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watchFile.callCount).toEqual(3);
      expect(fs.watchFile.argsForCall[0][0]).toEqual('dirName');
      expect(fs.watchFile.argsForCall[1][0]).toEqual('dirName/file0');
      expect(fs.watchFile.argsForCall[2][0]).toEqual('dirName/file1');
    });

    it('detects new files and watches those', function() {
      fs.readdir.reset();
      fs.watchFile.invokeCallback('');

      fs.readdir.invokeCallback('', ['file0']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watchFile.callCount).toEqual(1);
      expect(fs.watchFile.argsForCall[0][0]).toEqual('dirName/file0');
    });
  });
});
