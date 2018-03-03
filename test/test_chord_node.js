const net = require('net');
var should = require('should');
var ChordNode = require('../app');

describe('ChordNode', function() {
    node = new ChordNode('127.0.0.1', 41234);
    it('should have hostname and port properties set', function() {
        node.hostname.should.be.exactly('127.0.0.1');
        node.port.should.be.exactly(41234);
    });

    it('should be created with an id', function() {
        node.id.should.be.exactly('98c4c77306bfa6e5a8e574070441b676050f3166');
    });

    it('should be created with an empty finger table', function() {
        node.fingers.should.be.empty;
    });

    it('should be created with a null successor', function() {
        (node.successor === null).should.be.true;
    });

    it('should be created with a null predecessor', function() {
        (node.predecessor === null).should.be.true;
    });

    it('should respond to \'ping\' message with a \'pong\' message', function(done) {
        var client = new net.Socket();
        client.connect(41234, '127.0.0.1', function() {
            client.on('data', (response) => {
                response.toString().should.be.exactly('pong');
                client.end();
                done();
            });
            client.write(JSON.stringify({'id': 1, 'msg': 'ping'}));
        });
    });


    describe('#pingNode()', function() {
        node2 = new ChordNode('127.0.0.1', 41235);

        it ('should send a ping to the specified node, and get a pong response', function() {
            return node.pingNode({'id': 1, 'hostname': '127.0.0.1', 'port': 41235})
                .should.be.fulfilledWith('success')
        });

        var testServer = net.createServer((socket) => {
            socket.on('data', (data) => {
                // Don't respond to 'ping' at all
            });
        });
        testServer.listen(41236, '127.0.0.1');

        it ('should return a rejected promise if the given node timesout', function() {
            this.timeout(3000);
            return node.pingNode({'id': 1, 'hostname': '127.0.0.1', 'port': 41236})
                .should.be.rejectedWith('ping timeout')
        });

        testServer.close();
    });
});
