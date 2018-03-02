const net = require('net');
var crypto = require('crypto');

const m = 160;

var ChordNode = function(hostname, port) {
    this.hostname = hostname;
    this.port = port;
    this.id = generateId(hostname, port);
    var self = {
        'hostname': this.hostname,
        'port': this.port,
        'id': this.id
    };

    // ith entry in this table contains id of first node, s, that succeeds this node by
    // at least  2^(i-1)
    // Each entry includes the id, hostname, and port
    this.finger = [];
    this.successor = null;
    this.predecessor = null;

    var server = net.createServer((socket) => {
        socket.on('data', (data) => {
            data = JSON.parse(data)
            id = data.id
            msg = data.msg

            if (msg === 'ping') {
                socket.write(JSON.stringify({'id': this.id, 'msg': 'pong'}));
            }
        });
    });

    server.listen(port, hostname);

    /*
    generateId() gets this nodes ip and port and hashes it to generate a unique id
    */
    function generateId(hostname, port) {
        hash = crypto.createHash('sha1');
        hash.update(`${hostname}:${port}`);
        return hash.digest('hex');
    }

    /*
    closeServer shuts down this node's TCP server (mainly used in testing)
    */
    this.closeServer = function(callback) {
        server.close(() => {
            callback();
        });
    }

    /*
    pingNode will accept a node object, and ping it, and check if there is a pong response
    @return: a Promise that will be true on successful ping and pong if there is no response
    */
    this.pingNode = function(node) {
        var client = new net.Socket();
        return new Promise((resolve, reject) => {
            client.connect(node.port, node.hostname, function() {
                client.on('data', (data) => {
                    data = JSON.parse(data);
                    id = data.id;
                    msg = data.msg;

                    // TODO check id?
                    if (msg === 'pong') {
                        resolve('success');
                    }
                });

                client.on('timeout', () => {
                    reject(Error('Ping timedout'));
                });

                client.on('error', (err) => {
                    reject(err);
                });
            });
        });
    };
};

module.exports = ChordNode;
