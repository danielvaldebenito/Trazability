'use strict'

var mongoose = require('mongoose')
var Warehouse = require('../models/warehouse')
var createAddressWarehouse = function(req, res, next) {
    var warehouse = new Warehouse()
    warehouse.name = 'Dirección'
    warehouse.dependence = req.body.dependence
    warehouse.type = 'DIRECCION_CLIENTE'
    console.log('body', req.body)
    warehouse.save((err, wh) => {
        if(err) {
            console.log(err)
            return
        };
        req.body.warehouse = wh._id
        next();
    })
}
module.exports = {
    createAddressWarehouse
}