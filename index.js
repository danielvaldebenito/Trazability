'use strict'

var mongoose = require('mongoose');
var config = require('./config');
var app = require('./app');
var port = process.env.PORT || 3548;
mongoose.connect(`mongodb://${config.database.server}:${config.database.port}/${config.database.name}`, (err, res) => {
    if(err) {
        throw err;
    } else {
        console.log('La conexión a la Base de datos corriendo correctamente', config.database);
        app.listen(port, () => {
            console.log(`Servidor corriendo correctamente en el puerto ${port}`);
        })
    }
})