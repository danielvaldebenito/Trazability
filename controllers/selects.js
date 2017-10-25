'use strict'
const config = require('../config');
const fs = require('fs')
const User = require('../models/user')
const Device = require('../models/device')
const Vehicle = require('../models/vehicle')
const Dependence = require('../models/dependence')
const PriceList = require('../models/priceList')
const ProductType = require('../models/productType')
const InternalProcessType = require('../models/internalProcessType')
const mongoose = require('mongoose')
// .../api/select/vehicleTypes
function getvehicleTypes (req, res) {
    var types = config.entitiesSettings.vehicle.types;
    return res
        .status(200)
        .send({
            data: types
        })
}
function initialDataToDevice(req, res) {
    var distributor = req.params.distributor;
    var reasons = config.entitiesSettings.order.reasons;
    var paymentMethods = config.entitiesSettings.sale.paymentMethods;
    var maxProductTypesForOrder = config.entitiesSettings.order.maxProductTypesForOrder;
    ProductType.find()
                .exec((err, pts) => {
                    if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener tipos de producto', err})
                    return res
                        .status(200)
                        .send({
                            done: true,
                            code: 0,
                            data: {
                                reasons,
                                paymentMethods,
                                productTypes: pts,
                                maxProductTypesForOrder
                            },
                            message: 'OK'
                        })
                }
            )
    
}
function getPayMethods(req, res){
    var paymentMethods = config.entitiesSettings.sale.paymentMethods;
    
        return res
                .status(200)
                .send({
                    done: true,
                    code: 0,
                    data: paymentMethods,
                    message: 'OK'
                })
}
function getCountryData (req, res) {
    var data = JSON.parse(fs.readFileSync('./pais.json'))
    return res.status(200).send({data})
}
function getVehiclesToAsign (req, res) {
    var distributor = req.params.distributor;
    var type = req.query.type;
    Vehicle
        .where({ disabled: { $ne: true } })
        .find( type ? { type: type } : {})
        .where(distributor ? { distributor: distributor }: {})
        .populate ({ 
            path: 'warehouse',
            populate: { 
                path: 'dependence',
                populate: {
                    path: 'distributor',
                    match: distributor ? { '_id': distributor } : {}
                }
            }
        })
        .exec ((err, data) => {
            if(err) return res.status(500).send({ code : -1, done: false, message: 'Ha ocurrido un error', error: err })
            if(!data) return res.status(404).send({ code : 1, done: false, message: 'Error. La consulta no obtuvo datos'})

            res.status(200)
                .send({
                    done: true, 
                    message: 'OK',
                    data: data,
                    code: 0
                })
        })
}
function getDependences (req, res) {
    const distributor = req.query.distributor;
    const dependence = req.query.dependence
    Dependence
        .find(distributor ? { distributor: distributor }: {})
        .where(!dependence || dependence == 'null' ? {} : { _id:  dependence })
        .exec((err, data) => {
            if(err) return res.status(500).send({ code : -1, done: false, message: 'Ha ocurrido un error', error: err })
            if(!data) return res.status(404).send({ code : 1, done: false, message: 'Error. La consulta no obtuvo datos'})
                console.log('dependence', data)
            res.status(200)
                .send({
                    done: true, 
                    message: 'OK',
                    data: data,
                    code: 0,
                    dependence
                })
        })
}
function getPriceLists (req, res) {
    var distributor = req.params.distributor;
    PriceList.find(distributor ? { distributor: distributor } : {})
        .exec((err, pls) => {
            if (err) return res.status(500).send ({ done: false, code: -1, message: 'Error al obtener lista de precio', err: err});
            if(!pls) return res.status(404).send ({ done: false, code: 1, message: 'Error. No se pudo encontrar registros'})
            
            return res.status(200)
                        .send({
                            done: true,
                            code: 0,
                            message: 'OK',
                            data: pls
                        })
        })
}
function getRoles (req, res) {
    var roles = config.entitiesSettings.user.roles;
    return res.status(200)
                .send ({
                    done: true,
                    code: 0,
                    message: 'OK',
                    data: roles
                })
}
function getInternalProcessTypes (req, res) {
    InternalProcessType
        .find()
        .exec((e, data) => {
            return res.status(200)
                    .send({
                        done: true,
                        code: 0,
                        message: 'OK',
                        data: data
                    })
        })
}
function getUsersFromRol (req, res) {
    var rol = req.params.rol
    var distributor = req.params.distributor
    User.find({ roles: rol, distributor: distributor })
        .exec((err, users) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', err: err})
            if(!users) return res.status(404).send({ done: false, code: 1, message: 'No se ha encontrado usuarios'})
            return res.status(200)
                    .send({
                        done: true,
                        code: 0,
                        message: 'OK',
                        data: users
                    })
        })
}
function getOrderStates (req, res) {
    var states = config.entitiesSettings.order.status;
    return res.status(200).send({done: true,
                        code: 0,
                        message: 'OK',
                        data: states})
}
function getPos(req, res) {
    const distributor = req.params.distributor
    const type = req.query.type
    Device
        .find({ pos: { $ne: null }, user : { $ne: null }})
        .populate(type ? {
            path: 'user',
            match: {
                distributor: distributor,
                //online: true
            },
            populate: {
                path: 'vehicle',
                match: {
                    'type': type
                } 
            }
        } : {
            path: 'user',
            match: { distributor: distributor },
            populate: {
                path: 'vehicle'
            }

        })
        .exec((err, pos) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
            
            pos = pos.filter((p) => { return p.user != null })
            
            return res.status(200).send({ done: true, message: 'OK', data: pos, type })
        })
}
function getReasonsMaintenance(req, res) {
    const reasons = config.entitiesSettings.maintenance.reasons;
    return res.status(200).send({done: true, data: reasons })
}
function getTransactionTypes (req, res) {
    const tt = config.entitiesSettings.transaction.types;
    return res.status(200).send({ done: true, data: tt })
}
module.exports = {
    getvehicleTypes,
    initialDataToDevice,
    getCountryData,
    getVehiclesToAsign,
    getDependences,
    getPriceLists,
    getRoles,
    getInternalProcessTypes,
    getUsersFromRol,
    getOrderStates,
    getPayMethods,
    getPos,
    getReasonsMaintenance,
    getTransactionTypes
}