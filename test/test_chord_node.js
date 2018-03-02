var assert = require('assert');
var ChordNode = require('../app');

describe('ChordNode', function() {
    var node = new ChordNode('127.0.0.1', 5000);

    it('should be created with an id', function() {
        assert.equal(node.id, 'b660cd6180a4629b8e5f3c7eaeedcddf07dd1b1d');
    });
});
