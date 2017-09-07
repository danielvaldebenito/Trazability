'use strict'
var fs = require('fs')
var path = require('path')
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user')
var Device = require('../models/device')
var LoginHistory = require('../models/loginHistory')
var ProductType = require('../models/productType')
var PriceList = require('../models/priceList')
var DeviceConfig = require('../models/deviceConfig')
var jwt = require('../services/jwt')
var moment = require('moment')
var config = require('../config')
var fs = require('fs')
function pruebas(req, res) {
    res
    .status(200)
    .send({
        message: 'Probando una acción del controlador de usuarios del api rest' 
    })
}

function registerDevice(req, res) {
    var params = req.body;
    var firebaseToken = params.firebaseToken;
    var esn = params.esn;
    var version = params.version;
    Device.findOne({ esn: esn }, (err, device) => {
        if(err)
            return res.status(500).send({done: false, code: 1, data: null, message: 'Error al buscar PDA', error: err})
        if(!device)
        {
            // crearlo
            var dev = new Device({
                esn: esn,
                version: version,
                token: firebaseToken,
                tokenDate: moment(),
                status: 1
            })
            dev.save((error, devStored) => {
                if(error) return res.status(500).send({done: false, code: 2, data: null, message: 'Error al guardar PDA', error: error})
                if(!devStored) return res.status(404).send({done: false, code: 3, data: null, message: 'Error al guardar PDA'})
                
                return res.status(200)
                            .send({done: true, code: 0, data: devStored, message: 'OK'})
            })
        } else {
            // actualizar
            device.version = version
            device.tokenDate = moment()
            device.token = firebaseToken
            device.save((error, updatedDevice) => {
                if(error) return res.status(500).send({done: false, code: 5, data: null, message: 'Error al actualizar PDA', error})
                if(!updatedDevice) return res.status(404).send({done: false, code: 6, data: null, message: 'Error al actualizar PDA'})
                
                return res.status(200)
                            .send({done: true, code: 0, data: updatedDevice, message: 'OK'})
            })
        }

        
    })
}
function loginDevice (req, res) {
    
    var params = req.body
    var username = params.username
    var password = params.password
    var esn = params.esn
    var initialDataKey = params.initialDataKey
    var initialDataKeyConfig = config.entitiesSettings.initialDataKey
    var isSameDataKey = initialDataKey == initialDataKeyConfig
    User.findOne({username: username})
        .populate('vehicle')
        .exec((err, user) => {
            if(err) {
                res.status(500)
                    .send({ done: false, data: null, code: -1, message: 'Error en la petición', error: err})
            } else {
                if(!user) {
                    res.status(200)
                        .send({
                            done: true,
                            code: 2,
                            message: 'El usuario no existe',
                            data: null
                        })
                } else {
                    if(user.vehicle == undefined) {
                        return res.status(200)
                            .send({
                                done: false,
                                code: 3,
                                message: 'El usuario no tiene vehículo asignado',
                                data: null
                            })
                    }
                // Comprobar contraseña
                    bcrypt.compare(password, user.password, (error, check) => {
                        if(error) return res.status(500).send({ done: false, data: null, code: -1, message: 'Ocurrió un error', error: error })
                        if(check) {
                            // devolver los datos del usuario logueado

                            User.update({ _id: user._id }, { lastLogin: moment() }, (err, raw) => {
                                if (err)
                                    return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al actualizar último login usuario', error: err })
                                if (esn) {
                                    Device.findOne({ esn: esn }, (err, device) => {
                                        if (err)
                                            return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al buscar PDA', error: err })
                                        if (!device) {
                                            // crearlo
                                            var dev = new Device({
                                                esn: esn,
                                                status: 1,
                                                user: user._id
                                            })
                                            dev.save((error, devStored) => {
                                                if (error) return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al guardar PDA', error: error })
                                                if (!devStored) return res.status(404).send({ done: false, code: 3, data: null, message: 'Error al guardar PDA' })
                                                
                                                User.update({ _id: user._id }, { device: devStored._id }, (err, raw) => {
                                                    PriceList.find({ distributor: user.distributor })
                                                        .exec((err, priceLists) => {
                                                            if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener las listas de precio', err })
                                                            ProductType.find()
                                                                .exec((err, pts) => {
                                                                    if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener tipos de producto', err })
                                                                    return res.status(200)
                                                                        .send({
                                                                            done: true,
                                                                            code: 0,
                                                                            data: {
                                                                                user: user,
                                                                                token: jwt.createToken(user),
                                                                                devStored,
                                                                                initialData: isSameDataKey ? {} : {
                                                                                    reasons: config.entitiesSettings.order.reasons,
                                                                                    paymentMethods: config.entitiesSettings.sale.paymentMethods,
                                                                                    productTypes: pts,
                                                                                    initialDataKey: initialDataKeyConfig,
                                                                                    priceLists: priceLists
                                                                                }
                                                                            },
                                                                            message: 'OK',
                                                                        })
                                                                })
                                                        })
                                                    
                                                })
                                            })
                                        } else {
                                            Device.update({ _id: device._id }, { user: user._id }, (err, raw) => { 
                                                if (error) return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al actualizar PDA', error: error })
                                                User.update({ _id: user._id }, { device: device._id }, (err, raw) => {
                                                    PriceList.find({distributor: user.distributor})
                                                            .exec((err, priceLists) => {
                                                                if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener las listas de precio', err })
                                                                ProductType.find()
                                                                    .exec((err, pts) => {
                                                                        if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener tipos de producto', err })
                                                                        return res.status(200)
                                                                            .send({
                                                                                done: true,
                                                                                code: 0,
                                                                                data: {
                                                                                    user: user,
                                                                                    token: jwt.createToken(user),
                                                                                    updatedDevice: device,
                                                                                    initialData: isSameDataKey ? {} : {
                                                                                        reasons: config.entitiesSettings.order.reasons,
                                                                                        paymentMethods: config.entitiesSettings.sale.paymentMethods,
                                                                                        productTypes: pts,
                                                                                        initialDataKey: initialDataKeyConfig,
                                                                                        priceLists: priceLists
                                                                                    }
                                                                                },
                                                                                message: 'OK'
                                                                            })
                                                                    })
                                                            })
                                                })  
                                            }) 
                                        }
                                    })
                                } else {
                                    PriceList.find({distributor: user.distributor})
                                            .exec((err, priceLists) => {
                                                ProductType.find()
                                                    .exec((err, pts) => {
                                                        if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener tipos de producto', err })

                                                        return res.status(200)
                                                            .send({
                                                                done: true,
                                                                code: 0,
                                                                message: 'OK',
                                                                data: {
                                                                    user: user,
                                                                    token: jwt.createToken(user),
                                                                    initialData: isSameDataKey ? {} : {
                                                                        reasons: config.entitiesSettings.order.reasons,
                                                                        paymentMethods: config.entitiesSettings.sale.paymentMethods,
                                                                        productTypes: pts,
                                                                        initialDataKey: initialDataKeyConfig,
                                                                        priceLists: priceLists
                                                                    }
                                                                }
                                                            })
                                                    })
                                            })
                                    

                                }
                            })
                            

                        
                    } else {
                        var pass = bcrypt.hashSync(password)
                        res.status(200)
                        .send({
                                done: true,
                                code: 1,
                                data: null,
                                message: 'Usuario y/o Contraseña son incorrectos'
                            })
                    }
                })
            }
        }
    })
}

function getConfig (req, res) {
    var type = req.params.app;
    DeviceConfig.find({ app: type }, (err, records) => {
        if(err)
            return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err})
        if(!records)
            return res.status(400).send({ done: false, code: 1, message: 'Error al obtener los datos' })
        
        return res
            .status(200)
            .send({ 
                done: true,
                code: 0,
                message: 'OK', 
                data: records
            })
    })
}
module.exports = {
    pruebas,
    registerDevice,
    loginDevice,
    getConfig
}