'use strict'
const mongoose = require('mongoose');
const soap = require('soap-server')
const config = require('./config');
const app = require('./app');
const bodyParser = require('body-parser')
const port = process.env.PORT || 3548;
const mongoConnectionUrl = `mongodb://${config.database.user}:${config.database.password}@${config.database.server}:${config.database.port}/${config.database.name}`
//const mongoConnectionUrl = 'mongodb://unigas:09v9085a@localhost:27017/unigastrazabilidad'
mongoose.Promise = global.Promise;
mongoose.connect(mongoConnectionUrl, { useMongoClient: true }, (err, res) => {
    if(err) {
        console.log('error al conectarse a la base de datos', mongoConnectionUrl)
        throw err;
    } else {
        console.log('La conexión a la Base de datos corriendo correctamente', config.database);
        const server = app.listen(port, () => {
            console.log(`Servidor corriendo correctamente en el puerto ${port}`);
            
        })
        require('./services/pushSocket')
    }
})
