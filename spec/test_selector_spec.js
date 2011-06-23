describe('test selector', function() {
  var selector;

  beforeEach(function() {
    selector = require('jezebel/test_selector');
  });

  describe('find', function() {
    it('runs a single spec if thats all that changed', function() {
      expect(selector.select(process.cwd() + '/path/to/some_spec.js')).toEqual(['path/to/some_spec.js']);
    });

    it('runs all specs if any other javascript file has changed', function() {
      expect(selector.select(process.cwd() + '/path/to/file.js')).toEqual(['spec']);
    });

    it('runs no specs if an non-javascript file changes', function() {
      expect(selector.select(process.cwd() + '/path/to/somefile')).toBeUndefined();
    });
  });

  describe('find coffeescripts', function() {
    it('runs a single spec if thats all that changed', function() {
      expect(selector.select(process.cwd() + '/path/to/some_spec.coffee')).toEqual(['path/to/some_spec.coffee']);
    });

    it('runs all specs if any other javascript file has changed', function() {
      expect(selector.select(process.cwd() + '/path/to/file.coffee')).toEqual(['spec']);
    });

    it('runs no specs if an non-javascript file changes', function() {
      expect(selector.select(process.cwd() + '/path/to/somefile')).toBeUndefined();
    });
  });
});
