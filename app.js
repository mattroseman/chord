var crypto = require('crypto');

var ChordNode = function(hostname, port) {
    this.id = generate_id();

    /*
    generate_id() gets this nodes ip and port and hashes it to generate a unique id
    */
    function generate_id() {
        hash = crypto.createHash('sha1');
        hash.update(`${hostname}:${port}`);
        return hash.digest('hex');
    }
};

module.exports = ChordNode;
