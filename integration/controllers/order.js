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

    var order = new Order()
    var params = req.body
    order.erpId = params.salesforceId
    order.erpOrderNumber = params.orderNumber
    order.commitmentDate = moment(params.commitmentDate, "DD-MM-YYYY HH:mm:ss").isValid() ? moment(params.commitmentDate, "DD-MM-YYYY HH:mm:ss") : null;
    order.type = params.type == 'Granel' ? 'GRANEL' : 'ENVASADO'
    order.phone = params.phone
    order.observation = params.observation
    order.payMethod = params.payMethod
    order.client = params.client // From Middleware clientFromOrderByDevice
    order.address = params.address  // From Middleware createAddressWarehouseForOrder
    order.vehicle = params.vehicle // From Middleware getVehicleFromLicensePlate
    order.originWarehouse = params.originWarehouse; // From Middleware getWarehouseFromVehicle
    order.status = config.entitiesSettings.order.status[0];
    if(params.device) {
        order.status = config.entitiesSettings.order.status[1]; // ASIGNADO
    }
    order.destinyWarehouse = params.destinyWarehouse // From Middleware createAddressWarehouseForOrder
    order.distributor = params.distributor // From Middleware getVehicleFromLicensePlate
    order.items = params.items
    order.erpUpdated = true
    order.device = params.device 
    order.userName = 'SALESFORCE'
    const history = {
        device: params.device,
        date: moment(),
        userName: 'SALESFORCE',
        event: config.entitiesSettings.order.eventsHistory[0] // Creación
    }
    const histories = []
    histories.push(history)
    if(params.device) {
        const history2 = {
            device: params.device,
            date: moment(),
            userName: 'SALESFORCE',
            event: config.entitiesSettings.order.eventsHistory[1] // Asignación
        }
        histories.push(history2)
    }
    order.history = histories;
    order.save((err, stored) => {
        if(err) { 
            console.log('error', err); 
            return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
        }
        if(!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
        
        if(params.vehicle){
            pushNotification.newOrderAssigned(params.vehicle, JSON.stringify(stored))
        }
        
        pushSocket.send('/orders', params.distributor, 'new-order', stored._id)

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
