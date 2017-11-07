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
                    if(result.result) {
                        const sessionId = result.result.sessionId
                        config.integration.sessionId = sessionId
                        const sHeader = { SessionHeader: { sessionId: sessionId }};
                        client.addSoapHeader(sHeader, '', 'tns', '')
                        resolve(result.result.sessionId)
                    } else {
                        reject('No hay resultados')
                    }
                    
                } else {
                    reject('No hubo resultados')
                }
            });
        });

    });

    return p;

}

module.exports = {
    login
}