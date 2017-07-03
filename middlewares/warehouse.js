'use strict'

var mongoose = require('mongoose')
var Warehouse = require('../models/warehouse')
var Decrease = require('../models/decrease')

var createAddressWarehouse = function(req, res, next) {
    var warehouse = new Warehouse()
    warehouse.name = 'Dirección ' + req.body.location
    warehouse.dependence = req.body.dependence
    warehouse.type = 'DIRECCION_CLIENTE'
    warehouse.save((err, wh) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}
var createVehicleWarehouse = function(req, res, next) {
    var warehouse = new Warehouse()
    warehouse.name = 'Vehicle ' + req.body.licensePlate
    warehouse.dependence = req.body.dependence
    warehouse.type = 'VEHÍCULO'
    warehouse.save((err, wh) => {
        if(err) {
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}

var createStoreWarehouse = function(req, res, next) {
    var warehouse = new Warehouse()
    warehouse.name = 'Almacén ' + req.body.name
    warehouse.dependence = req.body.dependence
    warehouse.type = 'ALMACÉN'
    warehouse.save((err, wh) => {
        if(err) {
            console.log(err)
            res.status(500).send({ message: 'Error en middleware', error: err })
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}

module.exports = {
    createAddressWarehouse,
    createVehicleWarehouse,
    createStoreWarehouse
}