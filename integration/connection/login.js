var soap = require('soap');
var apiWSDL = __dirname + '/../wsdl/sfdcPartner.wsdl';
const testSaveOrder = __dirname + '/../wsdl/creaPedido_ws.wsdl';
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
                    const sessionId = result.result.sessionId
                    config.integration.sessionId = sessionId
                    const sHeader = { SessionHeader: { sessionId: sessionId }};
                    client.addSoapHeader(sHeader, '', 'tns', '')
                    
                    resolve(result)
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