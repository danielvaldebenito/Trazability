'use strict'

var mongoose = require('mongoose')
var Warehouse = require('../models/warehouse')

var createWarehouse = function(req, res, next) {
    var warehouse = new Warehouse()
    warehouse.name = 'test'
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
/*
name: { type: String, required: true },
    dependence: { type: Schema.ObjectId, ref: 'Dependence' },
    type: {
        type: String,
        enum: typesEnum
    }
 */

var getWareHouse = function (req, res, next) {
    
}

module.exports = {
    createWarehouse
}