var soap = require('soap');
var apiWSDL = __dirname + '/../wsdl/ValidarConexion.wsdl';
var login = require('./login')
var config = require('../../config')

function validateLogin() {
    var p = new Promise(function(resolve, reject) {
        soap.createClient(apiWSDL, function(err, client) {
            if(err) throw new Error(err);
            var args = {
                SessionHeader: {
                    sessionId: config.integration.sessionId
                }
            }
            client.ValidateLogin(args, function(err, result) {
                if(err) {
                    reject(err)
                    login.login()
                        .then(res => {
                            config.integration.sessionId = res.result.sessionId
                            resolve(res)
                        })
                        
                } else {
                    if(!result) {
                        reject('No se obtuvo resultados')
                    } else {
                        resolve(result)
                    }
                }
                
            });
        });
        
        
    });

    return p;

}

module.exports = {
    validateLogin
}