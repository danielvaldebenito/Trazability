'use strict'

var path = require('path')
var mongoose = require('mongoose')
var pagination = require('mongoose-pagination')
var moment = require('moment')
moment.locale('es')
var Order = require('../models/order')
var OrderItem = require('../models/orderItem')
var Warehouse = require('../models/warehouse')
var Distributor = require('../models/distributor')
var Dependence = require('../models/dependence')
var Address = require('../models/address')
var ProductType = require('../models/productType')
var config = require('../config')


function saveOrderFromErpIntegration (req, res) {

    var order = new Order()
    var params = req.body
    order.erpIds.push(params.idSalesforce)
    order.erpOrderNumber.push(params.numeroPedido)
    order.commitmentDate = moment(params.fechaCompromiso, "DD-MM-YYYY HH:mm:ss").isValid() ? moment(params.fechaCompromiso, "DD-MM-YYYY HH:mm:ss") : null;
    order.type = params.tipoPedido
    order.phone = params.telefono
    order.observation = params.observacion
    order.payMethod = params.formaDePago
    order.client = params.client // From Middleware findClient
    order.address = params.address  // From Middleware createAddressWarehouseForOrder
    order.vehicle = params.vehicle // From Middleware NO DESARROLLADO
    if(params.originWarehouse) {
        order.originWarehouse = params.originWarehouse; // From Middleware getWarehouseFromVehicle
        order.status = 'ASIGNADO';
    }
    order.destinyWarehouse = params.destinyWarehouse // From Middleware createAddressWarehouseForOrder
    order.distributor = params.distributor // From Middleware NO DESARROLLADO
    var item = {
        productType: params.productType, // From Middleware NO DESARROLLADO
        quantity: params.Cantidad,
        price: params.ValorUnitario,
        discount: params.Descuento,
        surcharge: 0
    }
    order.items.push(item);
    order.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
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
