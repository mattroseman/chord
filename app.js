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
    this.fingers = [];
    this.successor = null;
    this.predecessor = null;

    // ith entry in this table contains id of first node, s, that succeeds this node by
    // at least  2^(i-1)
    // Each entry includes the id, hostname, and port
    this.finger = [];
    this.successor = null;
    this.predecessor = null;

    /*
    generateId() gets this nodes ip and port and hashes it to generate a unique id
    */
    function generateId(hostname, port) {
        hash = crypto.createHash('sha1');
        hash.update(`${hostname}:${port}`);
        return hash.digest('hex');
    }

    var server = net.createServer((socket) => {
        socket.on('data', (request) => {
            request = JSON.parse(request);
            id = request.id;
            msg = request.msg;
            data = request.data;

            handleMessage(id, msg, data)
                .then((response) => {
                    socket.write(response);
                }).catch((err) => {
                    // Don't do anything if this is an unkown message
                });
        });
    });

    server.listen(port, hostname);

    /*
    closeServer shuts down this node's TCP server (mainly used in testing)
    */
    this.closeServer = function(callback) {
        server.close(() => {
            callback();
        });
    }

    /*
    handleMessage will look at some message to this node, and return a Promise with the appropriate response
    */
    function handleMessage(id, msg, data) {
        return new Promise((resolve, reject) => {
            switch (msg) {
                case 'ping':
                    resolve('pong');
                case 'findSuccessor':
                    if (data === null) {
                        reject(Error('no data'));
                    }
                    // TODO find the successor of the node in data
                default:
                    reject(Error('unknown message'));
            }
            if (msg === 'ping') {
                resolve('pong');
            } else {
                reject(Error('unknown message'));
            }
        });
    }

    /*
    sendMessage will send some message to the specified node, and return Promise with the response
    */
    function sendMessage(node, msg, data) {
        var client = new net.Socket();
        client.setTimeout(1000);

        return new Promise((resolve, reject) => {
            client.connect(node.port, node.hostname, () => {
                client.on('data', (response) => {
                    return resolve(response);
                });

                client.on('timeout', () => {
                    reject(Error('request timeout'));
                });

                client.on('error', (err) => {
                    reject(err);
                });

                client.write(JSON.stringify({'id': this.id, 'msg': msg, 'data': data}));
            });
        });
    }

    /*
    pingNode will accept a node object, and ping it, and check if there is a pong response
    @return: a Promise that will resolve on successful response and rejected on error or timeout
    */
    this.pingNode = function(node) {
        return new Promise((resolve, reject) => {
            sendMessage(node, 'ping')
                .then((response) => {
                    if (response.toString() === 'pong') {
                        resolve('success');
                    }

                    reject('unkown response');
                }).catch((err) => {
                    if (err.message === 'request timeout') {
                        reject(Error('ping timeout'));
                    }
                });
        });
    };

    /*
    join will attempt to join a chord network through the given node
    */
    this.join = function(node) {
        sendMessage(node, 'findSuccessor', self)
            .then((response) => {
                this.successor = JSON.parse(response);
            }).catch((err) => {
            });
    };
};

module.exports = ChordNode;
