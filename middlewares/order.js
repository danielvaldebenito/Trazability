'use strict'

const mongoose = require('mongoose')
const Order = require('../models/order')
const Sale = require('../models/sale')
const SaleItem = require('../models/saleItem')
const MovementItem = require('../models/movementItem')
const Client = require('../models/client')
const Enumerable = require('linq')
const config = require('../config')
const pushSocket = require('../services/pushSocket')
const moment = require('moment')
const pushNotification = require('../services/push')
const clientFromOrderByDevice = function (req, res, next) {
    const params = req.body

    const client = params.client
    if (!client) {
        return res.status(500).send({ done: false, code: -1, message: 'Debe enviar datos de cliente' })
    }
    const nit = client.nit
    Client.findOne({ nit: nit })
        .exec((err, found) => {
            if (found) {
                req.body.clientId = found._id
                console.log('cliente encontrado', found._id)
                next()
            } else {
                const address = {
                    location: params.address.location,
                    city: params.address.city,
                    region: params.address.region
                }
                const addresses = []
                addresses.push(address)
                const newclient = new Client({
                    nit: client.nit,
                    name: client.name,
                    surname: client.surname,
                    phone: client.phone,
                    email: client.email,
                    contact: client.name + ' ' + client.surname,
                    completeName: client.name + ' ' + client.surname,
                    quick: true,
                    addresses: addresses
                })
                newclient.save((err, stored) => {
                    if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al guardar cliente en middleware clientFromOrderByDevice', err })
                    if (!stored) return res.status(404).send({ done: false, code: 1, message: 'Error al guardar cliente en middleware clientFromOrderByDevice' })
                    req.body.client = stored._id
                    return next()
                })
            }
        })


}

// BEFORE: findCoordFromAddress (geocodig)

// BEFORE: createAddressWarehouseForOrder (warehouse) 

function saveOneByDevice(req, res, next) {
    
    const params = req.body
    if (params.delivery.orderId) {
        const status = params.delivery.done ? config.entitiesSettings.order.status[3] : config.entitiesSettings.order.status[4]
        Order.findById(params.delivery.orderId, (err, found) => {

            const update = {
                status: status,
                vehicle: params.vehicle,
                userName: req.user.name + ' ' + req.user.surname,
                device: params.device,
                originWarehouse: params.originWarehouse
            }

            if(found.device != params.device) {
                pushNotification.cancelOrder(found.device, found._id.toString(), found.orderNumber, "NO")
            }
            Order.update({ _id: params.delivery.orderId}, update, (err, updated) => {
                if(err) return res.status(200).send({ done: false, message: 'Error al actualizar pedido', err, code:-1})
                
                req.body.orderNumber = found.orderNumber
                req.body.orderId = params.delivery.orderId
                pushSocket.send('/orders', params.distributor, 'change-state-order', params.delivery.orderId)
                return next()
            })

           
        })
        
    } else {
        const order = new Order()
        order.commitmentDate = moment()
        order.client = params.clientId // From Middleware clientFromOrderByDevice
        order.address = params.address // From Middleware addressFromOrderByDevice
        order.vehicle = params.vehicle
        order.phone = params.phone
        order.type = params.type // ENVASADO o GRANEL
        order.distributor = params.distributor // Distribuidor dueño del pedido
        order.originWarehouse = params.originWarehouse // From Middleware originWarehouseFromOrderByDevice
        order.destinyWarehouse = params.destinyWarehouse // From Middleware addressFromOrderByDevice 
        order.status = config.entitiesSettings.order.status[3] // ENTREGADO
        order.items = params.itemsSale // From Middleware convertMovementDetailToSaleDetail
        order.observation = params.observation
        order.payMethod = params.paymentMethod
        order.device = params.device
        order.save((err, stored) => {
            if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al guardar', error: err })
            if (!stored) return res.status(404).send({ done: false, message: 'No ha sido posible guardar el registro' })
            Order.update(
                { _id: stored._id },
                { erpId: stored.orderNumber, erpOrderNumber: stored.orderNumber, erpUpdated: false },
                (err, raw) => {
                    /**
                     * TODO: ERP INTEGRATION: Informar pedido a SalesForce
                     */
                    pushSocket.send('/orders', params.distributor, 'new-order', stored)
                    req.body.orderNumber = stored.orderNumber
                    req.body.orderId = stored._id
                    next()
                }
            )
        })
    }

}

function validateDelivery (req, res, next) {
    console.log('validating', req.body)
    if(req.body.delivery.orderId) {
        Order.findById(req.body.delivery.orderId, (err, order) => {
            if(err) return res.status(200).send({ done: false, message: 'Ha ocurrido un error', code: -1, err })
            if(!order) return res.status(200).send({ done: false, message: 'No existe pedido con el id ' + req.body.delivery.orderId })
            if(order.status == config.entitiesSettings.order.status[3]) {
                console.log('ya esta entregado')
                return res.status(200).send({ done: true, message: 'OK' })
            } else {
                console.log('no es entregado, pasa al siguiente')
                next();
            }
        })
    } else {
        console.log('no trae orderId')
        next();
    }
}

module.exports = {
    clientFromOrderByDevice,
    saveOneByDevice,
    validateDelivery
}