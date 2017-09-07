'use strict'
var mongoose = require('mongoose');
var soap = require('soap-server')
var config = require('./config');
var app = require('./app');
var bodyParser = require('body-parser')
var port = process.env.PORT || 3548;
var mongoConnectionUrl = `mongodb://${config.database.user}:${config.database.password}@${config.database.server}:${config.database.port}/${config.database.name}`
//var mongoConnectionUrl = 'mongodb://unigas:09v9085a@localhost:27017/unigastrazabilidad'


mongoose.connect(mongoConnectionUrl, (err, res) => {
    if(err) {
        console.log('error al conectarse a la base de datos', mongoConnectionUrl)
        throw err;
    } else {
        console.log('La conexión a la Base de datos corriendo correctamente', config.database);
        var server = app.listen(port, () => {
            console.log(`Servidor corriendo correctamente en el puerto ${port}`);
            var loginService = require('./integration/connection/login')
            loginService.login()
                .then(res => { 
                    console.log('Conectado a web service Salesforce como', res.result.userInfo.userFullName)
                    config.integration.sessionId = res.result.sessionId
                })
                .catch(error => console.log(error))
        })




    }
})