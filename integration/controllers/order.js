'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var moment = require('moment')
moment.locale('es')
var Order = require('../../models/order')
var OrderItem = require('../../models/orderItem')
var Warehouse = require('../../models/warehouse')
var Distributor = require('../../models/distributor')
var Dependence = require('../../models/dependence')
var Address = require('../../models/address')
var ProductType = require('../../models/productType')
var config = require('../../config')
var pushSocket = require('../../services/pushSocket')
var pushNotification = require('../../services/push')


function saveOrderFromErpIntegration (req, res) {
    console.log('on save order', req.body)
    var order = new Order()
    var params = req.body
    order.erpId = params.salesforceId
    order.erpOrderNumber = params.orderNumber
    order.commitmentDate = moment(params.commitmentDate, "DD-MM-YYYY HH:mm:ss").isValid() ? moment(params.commitmentDate, "DD-MM-YYYY HH:mm:ss") : null;
    order.type = params.type
    order.phone = params.phone
    order.observation = params.observation
    order.payMethod = params.payMethod
    order.client = params.clientId // From Middleware clientFromOrderByDevice
    order.address = params.address  // From Middleware createAddressWarehouseForOrder
    order.vehicle = params.vehicle // From Middleware getVehicleFromLicensePlate
    if(params.originWarehouse) {
        order.originWarehouse = params.originWarehouse; // From Middleware getWarehouseFromVehicle
        order.status = 'ASIGNADO';
    }
    order.destinyWarehouse = params.destinyWarehouse // From Middleware createAddressWarehouseForOrder
    order.distributor = params.distributor // From Middleware getVehicleFromLicensePlate
    order.items = params.items

    order.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        if(params.vehicle){
            pushNotification.newOrderAssigned(params.vehicle, JSON.stringify(stored))
        }
        
        pushSocket.send('/orders', params.distributor, 'new-order', stored)

        return res
            .status(200)
            .send({ 
                done: true, 
                message: 'Registro guardado exitosamente', 
                stored: stored
            })
    })
}

module.exports = {
    saveOrderFromErpIntegration
}  
