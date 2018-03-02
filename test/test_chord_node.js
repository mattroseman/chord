const net = require('net');
var assert = require('assert');
var ChordNode = require('../app');

describe('ChordNode', function() {

    it('should have hostname and port properties set', function() {
        var node = new ChordNode('127.0.0.1', 41234);
        assert.equal(node.hostname, '127.0.0.1');
        assert.equal(node.port, 41234);
        node.closeServer();
    });

    it('should be created with an id', function() {
        var node = new ChordNode('127.0.0.1', 41234);
        assert.equal(node.id, '98c4c77306bfa6e5a8e574070441b676050f3166');
        node.closeServer();
    });

    it('should respond to \'ping\' message with a \'pong\' message', function(done) {
        var node = new ChordNode('127.0.0.1', 41234);
        var client = new net.Socket();
        client.connect(41234, '127.0.0.1', function() {
            client.on('data', (data) => {
                data = JSON.parse(data);
                id = data.id;
                msg = data.msg;
                assert.equal(id, '98c4c77306bfa6e5a8e574070441b676050f3166' );
                assert.equal(msg, 'pong');
                client.end();
            });
            client.write(JSON.stringify({'id': 1, 'msg': 'ping'}));
        });
        node.closeServer(() => {
            done();
        });
    });


    describe('#pingNode()', function(done) {
        it ('should send a ping to the specified node, and get a pong response', function() {
            node1 = new ChordNode('127.0.0.1', 41234);
            node2 = new ChordNode('127.0.0.1', 41235);

            node1.pingNode({'id': 1, 'hostname': '127.0.0.1', 'port': 41235})
                .then((result) => {
                    assert.equal(result, 'success');
                    node1.closeServer(_ => {
                        node2.closeServer(done);
                    });
                })
                .catch(err => {
                    node1.closeServer(_ => {
                        node2.closeServer(_ => {
                            done(err);
                        });
                    });
                });
        });
    });
});
