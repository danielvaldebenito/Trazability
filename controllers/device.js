'use strict'
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt-nodejs')
const User = require('../models/user')
const Distributor = require('../models/distributor')
const Device = require('../models/device')
const Order = require('../models/order')
const Vehicle = require('../models/vehicle')
const LoginHistory = require('../models/loginHistory')
const ProductType = require('../models/productType')
const PriceList = require('../models/priceList')
const DeviceConfig = require('../models/deviceConfig')
const jwt = require('../services/jwt')
const moment = require('moment')
const config = require('../config')
const pushNotification = require('../services/push')
const pushSocket = require('../services/pushSocket')

function pruebas(req, res) {
    res
        .status(200)
        .send({
            message: 'Probando una acción del controlador de usuarios del api rest'
        })
}
function registerDevice(req, res) {
    const params = req.body;
    const firebaseToken = params.firebaseToken;
    const esn = params.esn;
    const version = params.version;
    const traza = req.query.traza
    Device.findOne({ esn: esn }, (err, device) => {
        if (err)
            return res.status(500).send({ done: false, code: 1, data: null, message: 'Error al buscar PDA', error: err })
        if (!device) {
            // crearlo
            const dev = new Device({
                esn: esn,
                status: 1
            })
            if(traza) {
                dev.version2 = version;
                dev.token2 = firebaseToken;
                dev.tokenDate2 = moment();
            } else {
                dev.version = version;
                dev.token = firebaseToken;
                dev.tokenDate = moment();
            }
            dev.save((error, devStored) => {
                if (error) return res.status(500).send({ done: false, code: 2, data: null, message: 'Error al guardar PDA', error: error })
                if (!devStored) return res.status(404).send({ done: false, code: 3, data: null, message: 'Error al guardar PDA' })

                return res.status(200)
                    .send({ done: true, code: 0, data: devStored, message: 'OK' })
            })
        } else {
            // actualizar
            if(traza) {
                device.version2 = version;
                device.tokenDate2 = moment();
                device.token2 = firebaseToken;
            } else {
                device.version = version
                device.tokenDate = moment()
                device.token = firebaseToken
            }
            

            device.save((error, updatedDevice) => {
                if (error) return res.status(500).send({ done: false, code: 5, data: null, message: 'Error al actualizar PDA', error })
                if (!updatedDevice) return res.status(404).send({ done: false, code: 6, data: null, message: 'Error al actualizar PDA' })

                return res.status(200)
                    .send({ done: true, code: 0, data: updatedDevice, message: 'OK' })
            })
        }


    })
}
function loginDevice(req, res) { // VENTA 

    const params = req.body
    const username = params.username
    const password = params.password
    const esn = params.esn
    const licensePlate = params.licensePlate
    const vehicleId = params.vehicle
    const initialDataKey = params.initialDataKey
    const initialDataKeyConfig = config.entitiesSettings.initialDataKey
    const isSameDataKey = initialDataKey == initialDataKeyConfig
    User.findOne({ username: username })
        .populate('dependence')
        .populate('distributor')
        .exec((err, user) => {
            if (err) {
                return res.status(500)
                    .send({ done: false, data: null, code: -1, message: 'Error en la petición', error: err })
            } else {
                if (!user) {
                    return res.status(200)
                        .send({
                            done: true,
                            code: 2,
                            message: 'El usuario no existe',
                            data: null
                        })
                } else if(user.disabled) {
                    return res.status(200)
                    .send({
                        done: true,
                        code: 2,
                        message: 'Usuario se encuentra deshabilitado',
                        data: null
                    })
                } else {
                    // Comprobar contraseña
                    bcrypt.compare(password, user.password, (error, check) => {
                        if (error) return res.status(500).send({ done: false, data: null, code: -1, message: 'Ocurrió un error', error: error })
                        if (!check) {
                            return res.status(200)
                                .send({
                                    done: true,
                                    code: 1,
                                    data: null,
                                    message: 'Usuario y/o Contraseña son incorrectos'
                                })
                        }


                        // Determina si hay otro usuario logueado con el mismo vehículo
                        User.findOne({ vehicle: vehicleId, online: true, _id: { $ne: user._id } }, (err, logueado) => {
                            if (err) return res.status(500).send({ done: false, code: -1, message: 'Error buscando usuario online', err })
                            if (logueado) {
                                return res.status(200).send({ done: false, message: 'El vehículo indicado, ya tiene un usuario que se encuentra en línea. Verifique el número de placa ingresada o comuníquese con su administrador', code: 3 })
                            } else {
                                Vehicle.findByIdAndUpdate(vehicleId, { user: user._id })
                                    .exec((err, vehicle) => {
                                        if (err) return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al buscar el vehículo', error: err })
                                        if (!vehicle) return res.status(200).send({ done: false, code: 1, message: 'No existe un vehículo con la placa ' + licensePlate })
                                        if (vehicle.disabled) return res.status(200).send({ done: false, message: 'Vehículo se encuentra deshabilitado. Consulte con su administrador.', code: 1 })
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
                                                    if (!devStored) return res.status(404).send({ done: false, code: 1, data: null, message: 'Error al guardar PDA' })

                                                    User.findByIdAndUpdate(user._id, { device: devStored._id, vehicle: vehicle._id }, (err, raw) => {
                                                        if (raw.disabled) return res.status(200).send({ done: false, message: 'Usuario se encuentra deshabilitado. Consulte con su administrador.', code: -1 })
                                                        return res.status(200)
                                                            .send({
                                                                done: false,
                                                                code: 0,
                                                                message: 'Dispositivo todavía no tiene código POS asociado. Consulte con su administrador.',
                                                            })
                                                    })
                                                })
                                            } else {
                                                Device.findByIdAndUpdate(device._id, { user: user._id }, (err, dev) => {
                                                    if (err) return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al actualizar PDA', error: err })
                                                    const update = device.pos ? { device: dev._id, lastLogin: moment(), online: true, vehicle: vehicleId } : { device: dev._id, vehicle: vehicleId }
                                                    User.findByIdAndUpdate(user._id, update, (err, us) => {
                                                        if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al actualizar usuario', err })

                                                        if (us.disabled) return res.status(200).send({ done: false, message: 'Usuario se encuentra deshabilitado. Consulte con su administrador.', code: -1 })
                                                        if (!device.pos) {
                                                            return res.status(200)
                                                                .send({
                                                                    done: false,
                                                                    code: 0,
                                                                    message: 'Dispositivo todavía no tiene código POS asociado. Consulte con su administrador.',
                                                                })
                                                        } else {
                                                            Device.update({ user: us._id, _id: { $ne: dev._id } }, { user: null }, { multi: true }, (err, ok) => {
                                                                if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar dispositivos anteriores del usuario', err })
                                                                Vehicle.update({ user: us._id, _id: { $ne: vehicleId } }, { user: null }, { multi: true }, (err, veh) => {
                                                                    if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar vehículos anteriores del usuario', err })
                                                                    User.update({ device: dev._id, _id: { $ne: us._id } }, { device: null, vehicle: null }, { multi: true }, (err, ok) => {
                                                                        if (err) return res.status(500).send({ done: false, code: -1, message: 'Error al actualizar usuarios con el mismo device', err })

                                                                        Distributor.findById(user.distributor._id, (err, dist) => {
                                                                            if(err) return res.status(500).send({ done: false, message: 'No existe distribuidor', err})
                                                                            let cities = []
                                                                            if(dist.deliveryLocations) {
                                                                                cities = dist.deliveryLocations.map((c) => { return c.city });
                                                                            }

                                                                            PriceList.find({ city: { $in: cities } })
                                                                                .populate({ path: 'items.productType', select: ['_id', 'code', 'name'] })
                                                                                .exec((err, priceLists) => {
                                                                                    if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener las listas de precio', err })
                                                                                    
                                                                                    if(!priceLists || !priceLists.length || priceLists.length == 0) {
                                                                                        return res.status(200).send({ done: false, code: 1, message: 'Su distribuidor no tiene listas de precios asociadas. Consulte con su administrador' })
                                                                                    }

                                                                                    ProductType
                                                                                        .find()
                                                                                        .exec((err, pts) => {
                                                                                            if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener tipos de producto', err })

                                                                                            pushSocket.send('vehicles', user.distributor._id, 'login', device._id)
                                                                                            return res.status(200)
                                                                                                .send({
                                                                                                    done: true,
                                                                                                    code: 0,
                                                                                                    data: {
                                                                                                        user: user,
                                                                                                        token: jwt.createToken(user),
                                                                                                        device: dev,
                                                                                                        vehicle: vehicle,
                                                                                                        initialData: isSameDataKey ? {} : {
                                                                                                            reasons: config.entitiesSettings.order.reasons,
                                                                                                            paymentMethods: config.entitiesSettings.sale.paymentMethods,
                                                                                                            productTypes: pts,
                                                                                                            initialDataKey: initialDataKeyConfig,
                                                                                                            maxProductTypesForOrder: config.entitiesSettings.order.maxProductTypesForOrder
                                                                                                        },
                                                                                                        priceLists: priceLists
                                                                                                    },
                                                                                                    message: 'OK'
                                                                                            })


                                                                                    })
                                                                            })
                                                                        })
                                                                        
                                                                    })

                                                                })

                                                            })

                                                        }

                                                    })
                                                })
                                            }
                                        })

                                    })
                            }

                        })

                    })
                }
            }
        })
}
function logout(req, res) {
    const username = req.params.username
    const bo = req.query.bo
    User.findOneAndUpdate({ username: username }, { online: false, lastLogout: moment(), vehicle: null }, (err, user) => {
        if (err) return res.status(200).send({ done: false, message: 'Ha ocurrido un error al actualizar usuario', err })

        const veh = user.vehicle
        Vehicle.findByIdAndUpdate(veh, { user: null }, (err, vehicle) => {
            if (err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar vehículo', err, code: -1 })

            if (bo) {
                pushNotification.forceResetVehicle(user.device)
            }
            pushSocket.send('vehicles', user.distributor, 'logout', user.device)
            return res.status(200).send({
                done: true,
                message: 'Usuario deslogueado correctamente',
                code: 0
            })
        })


    })
}
function loginTrazability(req, res) {
    const params = req.body
    const username = params.username
    const password = params.password
    const esn = params.esn
    const version = params.version
    const initialDataKey = params.initialDataKey
    const initialDataKeyConfig = config.entitiesSettings.initialDataKey
    const isSameDataKey = initialDataKey == initialDataKeyConfig
    User.findOne({ username: username })
        .populate('internalProcess')
        .populate('internalProcessTypes')
        .populate('dependence')
        .exec((err, user) => {
            if (err) {
                res.status(500)
                    .send({ done: false, data: null, code: -1, message: 'Error en la petición', error: err })
            } else {
                if (!user) {
                    return res.status(200)
                        .send({
                            done: true,
                            code: 2,
                            message: 'El usuario no existe',
                            data: null
                        })
                } else if(user.disabled) {
                    return res.status(200)
                    .send({
                        done: true,
                        code: 2,
                        message: 'El usuario se encuentra deshabilitado',
                        data: null
                    })
                } else {
                    // Comprobar contraseña
                    bcrypt.compare(password, user.password, (error, check) => {
                        if (error) return res.status(500).send({ done: false, data: null, code: -1, message: 'Ocurrió un error', error: error })
                        if (check) {
                            // devolver los datos del usuario logueado

                            User.update({ _id: user._id }, { lastLogin: moment(), online: true }, (err, raw) => {
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
                                                user2: user._id,
                                                version2: version
                                            })
                                            dev.save((error, devStored) => {
                                                if (error) return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al guardar PDA', error: error })
                                                if (!devStored) return res.status(404).send({ done: false, code: 3, data: null, message: 'Error al guardar PDA' })

                                                User.update({ _id: user._id }, { device: devStored._id }, (err, raw) => {
                                                    if (err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar usuario con su dispositivo', err })
                                                    
                                                    return res.status(200)
                                                        .send({
                                                            done: true,
                                                            code: 0,
                                                            data: {
                                                                user: user,
                                                                token: jwt.createToken(user),
                                                                device: devStored,
                                                                initialData: isSameDataKey ? {} : {
                                                                    initialDataKey: initialDataKeyConfig,
                                                                    maintenanceReasons: config.entitiesSettings.maintenance.reasons
                                                                }
                                                            },
                                                            message: 'OK',
                                                        })
                                                })
                                            })


                                        } else {
                                            Device.update({ _id: device._id }, { user2: user._id, version2: version }, (err, raw) => {
                                                if (error) return res.status(500).send({ done: false, code: -1, data: null, message: 'Error al actualizar PDA', error: error })
                                                User.update({ _id: user._id }, { device: device._id }, (err, raw) => {

                                                   
                                                    return res.status(200)
                                                        .send({
                                                            done: true,
                                                            code: 0,
                                                            data: {
                                                                user: user,
                                                                token: jwt.createToken(user),
                                                                device: device,
                                                                initialData: isSameDataKey ? {} : {
                                                                    initialDataKey: initialDataKeyConfig,
                                                                    maintenanceReasons: config.entitiesSettings.maintenance.reasons
                                                                }
                                                            },
                                                            message: 'OK'
                                                        })
                                                })
                                            })
                                        }
                                    })
                                } else {
                                    return res.status(200)
                                        .send({
                                            done: false,
                                            code: 1,
                                            message: 'No se recibió ESN',
                                        })
                                }
                            })
                        } else {
                            return res.status(200)
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
function getConfig(req, res) {
    var type = req.params.app;
    DeviceConfig.find({ app: type }, (err, records) => {
        if (err)
            return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err })
        if (!records)
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
function getDevices(req, res) {
    const filter = req.query.filter
    //const distributor = req.query.distributor
    const limit = req.query.limit || 200
    const page = req.query.page || 1

    Device
        .find()
        .sort([['pos', 1]])
        .populate([
            { 
                path: 'user', 
                populate: { 
                    path: 'distributor'
                }
            },
            { 
                path: 'user2', 
                populate: { 
                    path: 'distributor'
                }
            }
        ])

        .paginate(page, limit, (err, records, total) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err })
            const length = records.length
            if(filter) {
                
                records = records.filter((record) => {
                    let firstFilter = (record.esn && record.esn.toLowerCase().indexOf(filter.toLowerCase()) > -1) || (record.pos && record.pos.toLowerCase().indexOf(filter.toLowerCase()) > -1)
                    if(!record.user && !record.user2)
                        return firstFilter;
                    else {
                        if(record.user && record.user.distributor) {
                            return firstFilter || record.user.distributor.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 
                        } else if(record.user2 && record.user2.distributor) {
                            return firstFilter || record.user2.distributor.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
                        } else {
                            return firstFilter
                        }
                    }
                });
                
            }
            const newLength = records.length
            total = total - (length - newLength)
            return res
                .status(200)
                .send({ 
                    done: true, 
                    message: 'OK', 
                    data: records, 
                    total: total
                })
        })

}
function setPos(req, res) {
    const deviceId = req.body.device
    const pos = req.body.pos
    Device.findById(deviceId, (err, device) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar device', err})
        if(!device) return res.status(404).send({ done: false, message: 'No existe dispositivo'})
        Device.findOne ({ 
            _id: { $ne: device._id },
            pos: pos
         }, (err, dev) => {
             if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al buscar otros devices', err})
             if(dev) return res.status(200).send({ done: false, message: 'La POS ingresada está siendo ocupada para el dispositivo: ' + dev.esn})
         
             Device.update({ _id: device._id }, { pos: pos }, (err, ok) => {
                 if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al establecer POS', err})
                 if(!ok) return res.status(404).send({ done: false, message: '¡Ocurrió algo inesperado!'})
                 return res.status(200)
                        .send({ done: true, message: 'POS establecida correctamente'})
             })
        })
    })
}
function deleteOne(req, res) {
    const id = req.params.id
    Device.findById(id, (err, device) => {
        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err })
        if(device.user || device.user2) {
            return res.status(200).send({ done: false, message: 'El dispositivo tiene un usuario asociado'})
        }
        
        Device.findByIdAndRemove(id, (err, deleted) => {
            if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err })
            return res.status(200)
                    .send({
                        done: true,
                        message: 'Dispositivo eliminado'
                    })
        })
    })
}
module.exports = {
    pruebas,
    registerDevice,
    loginDevice,
    loginTrazability,
    logout,
    getConfig,
    getDevices,
    setPos,
    deleteOne
}