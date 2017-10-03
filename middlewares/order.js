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
                next()
            } else {
                const newclient = new Client({
                    nit: client.nit,
                    name: client.name,
                    surname: client.surname,
                    phone: client.phone,
                    email: client.email,
                    contact: client.name + ' ' + client.surname,
                    completeName: client.name + ' ' + client.surname,
                    quick: true,
                    addresses: [{
                        location: params.address.location,
                        city: params.address.city,
                        region: params.address.region
                    }]
                })
                newclient.save((err, stored) => {
                    if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al guardar cliente en middleware clientFromOrderByDevice', err })
                    if (!stored) return res.status(404).send({ done: false, code: 1, message: 'Error al guardar cliente en middleware clientFromOrderByDevice' })
                    req.body.clientId = stored._id
                    return next()
                })
            }
        })


}

// BEFORE: findCoordFromAddress (geocodig)

// BEFORE: createAddressWarehouseForOrder (warehouse) 

function saveOneByDevice(req, res, next) {
    const order = new Order()
    const params = req.body
    if (params.delivery.orderId) {
        Order.update(
            { _id: params.delivery.orderId },
            { status: params.delivery.done ? config.entitiesSettings.order.status[3] : config.entitiesSettings.order.status[4] },
            (err, raw) => {
                pushSocket.send('/orders', params.distributor, 'change-state-order', params.delivery.orderId)
                return next()
            }
        )
    } else {
        
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
                    next()
                }
            )
        })
    }

}
module.exports = {
    clientFromOrderByDevice,
    saveOneByDevice
}