'use strict'
var fs = require('fs')
var path = require('path')
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user')
var Device = require('../models/device')
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
                            .send({done: false, code: 0, data: devStored, message: 'OK'})
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
                            .send({done: false, code: 0, data: updatedDevice, message: 'OK'})
            })
        }

        
    })
}
function loginDevice (req, res) {
    
    var params = req.body
    var username = params.username
    var password = params.password
    var esn = params.esn
    User.findOne({username: username}, (err, user) => {
        if(err) {
            res.status(500)
                .send({ done: false, data: null, code: -1, message: 'Error en la petición', error: err})
        } else {
            if(!user) {
                res.status(200)
                    .send({
                        done: false,
                        code: 2,
                        message: 'El usuario no existe',
                        data: null
                    })
            } else {
                // Comprobar contraseña
                bcrypt.compare(password, user.password, (error, check) => {
                    if(error) return res.status(500).send({ done: false, data: null, code: -1, message: 'Ocurrió un error', error: error })
                    if(check) {
                        // devolver los datos del usuario logueado
                        user.lastLogin = moment.unix()
                        user.save()

                        if(esn) {
                            Device.findOne({ esn: esn }, (err, device) => {
                                if(err)
                                    return res.status(500).send({done: false, code: -1, data: null, message: 'Error al buscar PDA', error: err})
                                if(!device)
                                {
                                    // crearlo
                                    var dev = new Device({
                                        esn: esn,
                                        status: 1,
                                        user: user._id
                                    })
                                    dev.save((error, devStored) => {
                                        if(error) return res.status(500).send({done: false, code: -1, data: null, message: 'Error al guardar PDA', error: error})
                                        if(!devStored) return res.status(404).send({done: false, code: 3, data: null, message: 'Error al guardar PDA'})
                                        
                                        return res.status(200)
                                                    .send({done: true, code: 0, data: { user: user, token: jwt.createToken(user), devStored }, message: 'OK'})
                                    })
                                } else {
                            
                                    device.user = user._id
                                    device.save((error, updatedDevice) => {
                                        if(error) return res.status(500).send({done: false, code: -1, data: null, message: 'Error al actualizar PDA', error: error})
                                        if(!updatedDevice) return res.status(404).send({done: false, code: 4, data: null, message: 'Error al actualizar PDA'})
                                        
                                        return res.status(200)
                                                    .send({done: true, code: 0, data: { user: user, token: jwt.createToken(user), updatedDevice }, message: 'OK'})
                                    })
                                }

                                
                            })
                        } else {
                            res.status(200)
                            .send({
                                done: true,
                                code: 0,
                                message: 'OK',
                                data: { user: user, token: jwt.createToken(user)}
                            }) 
                        }

                        
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
            return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
        if(!records)
            return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
        
        return res
            .status(200)
            .send({ 
                done: true, 
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