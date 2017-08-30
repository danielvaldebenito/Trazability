var soap = require('soap');
var apiWSDL = __dirname + '/../wsdl/sfdcPartner.wsdl';
var config = require('../../config')
function login() {
    var p = new Promise(function(resolve, reject) {
        soap.createClient(apiWSDL, function(err, client) {
            if(err) throw new Error(err);

            var args = {
                username: config.integration.username,
                password: config.integration.password
            }

            client.login(args, function(err, result) {
                if(err) reject(err);
                if(result) {
                    resolve(result)
                }
            });
        });

    });

    return p;

}

module.exports = {
    login
}