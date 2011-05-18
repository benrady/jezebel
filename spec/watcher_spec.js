describe('watcher', function() {
  var watcher, fs;

  beforeEach(function() {
    watcher = require('jezebel/watcher');
    fs = require('fs');
    spyOn(fs, 'watchFile');
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
  });

  describe('watching a directory', function() {
    it('calls watchFile on all files in the directory', function() {
      spyOn(fs, 'readdir');
      watcher.watchFiles('dirName', {});
      fs.stat.invokeCallback('', {isDirectory : function(){return true;}});

      fs.readdir.invokeCallback('', ['file0', 'file1']);
      fs.stat.invokeCallback('', {isDirectory : function(){return false;}});

      expect(fs.watchFile.callCount).toEqual(2);
      expect(fs.watchFile.argsForCall[0][0]).toEqual('dirName/file0');
      expect(fs.watchFile.argsForCall[1][0]).toEqual('dirName/file1');
    });
    
  });
});
