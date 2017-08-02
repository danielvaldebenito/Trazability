'use strict'
var fs = require('fs')
var path = require('path')
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user')
var Vehicle = require('../models/vehicle')
var InternalProcessType = require('../models/internalProcessType')
var jwt = require('../services/jwt')
var moment = require('moment')
var config = require('../config')
var fs = require('fs')
var mail = require('../services/mail')
function pruebas(req, res) {
    
    res
    .status(200)
    .send({
        message: 'Probando una acción del controlador de usuarios del api rest' 
    })
}
function saveUser (req, res) {
    var params = req.body
    var user = new User ()
    user.username = params.username
    user.name = params.name
    user.surname = params.surname
    user.email = params.email
    user.isAdmin = params.isAdmin || false
    user.distributor = params.distributor
    
    var roles = params.roles
    var rolesUser = []
    if (roles) {
        if(roles.isAdmin){
            rolesUser.push('ADMIN')
            user.isAdmin = true
        } 
        if(roles.isVehicle){
            rolesUser.push('VEHÍCULO')
            user.vehicle = params.vehicle
        } 
        if(roles.isOperator){
            var process = params.process;
            rolesUser.push('OPERADOR PLANTA')
            if(process){
                var ip = []
                process.forEach((el) => {
                    console.log('process', el)
                    if(el.selected)
                        ip.push(el.id)
                });
                user.internalProcessTypes = ip;
            }
        }   
        user.roles = rolesUser
    }
    
        
    user.image = null
    var tempPass = Math.random().toString(36).slice(2);
    user.tempPassword = tempPass;
    if(user.vehicle) {
        User.update({ vehicle: user.vehicle, _id: { $ne: user._id }}, {vehicle: undefined },{multi: true}, (err, raw) => {
            if(err) return console.log(err)
            console.log('RAW', raw)
        });
        Vehicle.findByIdAndUpdate(user.vehicle, { user: user._id }, (err, vehicle) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar vehículo', err })
            
        })
    }
    user.save((err, stored) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al guardar', err })
        if(!stored) return res.status(404).send({ done: false, message: 'No se pudo guardar el usuario' })
        
        mail.sendMail(user.email, 
            'Trazabilidad - Contraseña Temporal', 
            user.tempPassword, 
            user.name + ' ' + user.surname)
        
        return res.status(200).send({ done: true, message: 'Usuario guardado. Se ha enviado un e-mail a la casilla especificada con la clave temporal', stored: stored})
        
        
    })
}
function loginUser (req, res) {
    var params = req.body
    var username = params.username
    var password = params.password
    User
        .findOne({username: username})
        .populate('distributor')
        .exec((err, user) => {
        if(err) {
            res.status(500)
                .send({message: 'Error en la petición'})
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
                if(user.tempPassword == password)
                {
                    res.status(200)
                    .send({
                            done: true,
                            code: 1,
                            data: null,
                            message: 'OK'
                        })
                } else {
                    bcrypt.compare(password, user.password, (error, check) => {
                        if(error) return res.status(500).send({ message: 'Ocurrió un error', error: error })
                        if(check) {
                        // devolver los datos del usuario logueado
                            user.lastLogin = moment.unix()
                            user.save()
                            res.status(200)
                                .send({
                                done: true,
                                code: 0,
                                message: 'OK',
                                data: { user: user, token: jwt.createToken(user)}
                            }) 
                        } else {
                            res.status(200)
                            .send({
                                    done: false,
                                    code: 1,
                                    data: null,
                                    message: 'Usuario y/o Contraseña son incorrectos'
                                })
                        }
                })
                    
                }
                        
                // Comprobar contraseña
                
            }
        }
    })
}
function updatePass (req, res) {
    var body = req.body
    console.log('resetpass', body)
    var temporalPass = body.temporalPassword;
    var newPass = body.newPassword;
    var username = body.username;
    var fromModal = body.fromModal;
    if(fromModal) {
        User.findOne({ username: username})
            .exec((error, user) => {
                if(error) return res.status(500).send({ done: false, message: 'No se ha encontrado el usuario', code: -1, error})
                if(!user) return res.status(404).send({ done: false, code: 1, message: 'Los datos ingresados no son correctos'})
                bcrypt.compare(temporalPass, user.password, (err, check) => {
                    if(err) return res.status(500).send({done: false, message: 'No se pudo comparar contraseñas', code: -1, err})
                    if(check) {
                        bcrypt.hash(newPass, null, null, (err, hash) => {
                            user.password = hash;
                            user.save((err, userSaved) => {
                                return res.status(200).send({ done: true, message: 'Contraseña actualizada', stored: userSaved})
                            })
                        })
                    } else {
                        return res.status(200)
                                    .send({
                                        done: false,
                                        message: 'La contraseña indicada es incorrecta',
                                        code: 1
                                        
                                    })
                    }
                })
            })
    } else {
        User.findOne({username: username, tempPassword: temporalPass})
        .exec((error, user) => {
            if(error) return res.status(500).send({ done: false, message: 'No se ha encontrado el usuario', code: -1, error})
            if(!user) return res.status(404).send({ done: false, code: 1, message: 'Los datos ingresados no son correctos'})
            bcrypt.hash(newPass, null, null, (err, hash) => {
                user.password = hash
                user.tempPassword = null
                user.save((err, stored) => {
                    if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error al actualizar' })
                    if(!stored) return res.status(404).send({ done: false, message: 'No se pudo actualizar el usuario' })
                    res.status(200).send({ done: true, message: 'Password actualizada', stored: stored})
                })
            })
        })
    }
    
}
function updateUser(req, res) {
    var userId = req.params.id
    
    var update = req.body
    console.log('update', update, userId)
    var user = update;
    
    var roles = update.roles
    var rolesUser = []
    if (roles) {
        if(roles.isAdmin){
            rolesUser.push('ADMIN')
            user.isAdmin = true
        } else {
            user.isAdmin = false
        }
        if(roles.isVehicle){
            rolesUser.push('VEHÍCULO')
            user.vehicle = update.vehicle
        } else {
            user.vehicle = null
        }
        if(roles.isOperator){
            var process = update.process;
            rolesUser.push('OPERADOR PLANTA')
            if(process){
                var ip = []
                process.forEach((el) => {
                    if(el.selected)
                        ip.push(el.id)
                });
                user.internalProcessTypes = ip;
            }
            
        } else {
            user.internalProcessTypes = null
        } 
        user.roles = rolesUser
    }
    if(user.vehicle) {
        User.update({ vehicle: user.vehicle, _id: { $ne: userId } }, {vehicle: undefined },{multi: true}, (err, raw) => {
            if(err) return console.log(err)
            console.log('raw', raw)
        });
        Vehicle.findByIdAndUpdate(user.vehicle, { user: userId }, (err, vehicle) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al actualizar vehículo', err })
            
        })
    }
    User.findByIdAndUpdate(userId, user, (err, updated) => {
        if(err) {
            return res.status(500)
                .send({message: 'Error al actualizar el registro', err})
        } else {
            if(!updated) return res.status(404).send({message: 'No se ha podido actualizar'})
            
            return res.status(200).send({ done: true, message: 'Usuario actualizado correctamente', updated: updated})
        } 
        
    })
}
function uploadImage(req, res) {
    var userId = req.params.id
    console.log(req.files)
    if(req.files) {
        var file_path = req.files.image.path
        var file_split = file_path.split('\\')
        var file_name = file_split[2]
        var ext_split = file_name.split('\.')
        var file_ext = ext_split[1]
        var extensionsAllowed = ['png', 'jpg', 'bmp', 'jpeg']
        if(extensionsAllowed.indexOf(file_ext) == -1) {
            res.status(404)
            .send({
                message: 'La extensión del archivo no es válida'
            })
        }
        User.findByIdAndUpdate(userId, {image: file_name}, (err, updated) => {
            if(!updated)
            {
                res.status(404)
                    .send({message: 'No se ha podido actualizar'})
            } else {
                res.status(200)
                    .send({message: 'Datos actualizados', updated: updated})
            }
        })
        
    } else {
        res.status(200)
            .send({
                message: 'No has subido ninguna imagen'
            })
    }

}
function getImageFile(req, res) {
    var imageFile = req.params.imageFile
    var filePath = './uploads/users/' + imageFile
    fs.exists(filePath, (exists) => {
        if(exists) {
            res.sendFile(path.resolve(filePath))
        } else {
            res.status(400).send({message: 'Imagen no existe'})
        }
    })
}
function getUsers (req, res){
    var distributor = req.params.distributor;
    var page = parseInt(req.query.page) || 1
    var limit = parseInt(req.query.limit) || 200
    var sidx = req.query.sidx || 'name'
    var sord = req.query.sord || 1 
    var filter = req.query.filter
    
    User.find({ distributor: distributor })
        .populate('vehicle')
        .populate('internalProcessTypes')
        .where(filter ? 
            { $or: [ { name: { "$regex": filter, "$options": "i" }},
                    { surname: { "$regex": filter, "$options": "i" }} ] }
             : {})
        .sort([[sidx, sord]])
        .paginate(page, limit, (err, records, total) => {
            if(err)
                return res.status(500).send({ done: false, message: 'Ha ocurrido un error', error: err})
            if(!records)
                return res.status(400).send({ done: false, message: 'Error al obtener los datos' })
            return res
                    .status(200)
                    .send({ 
                        done: true, 
                        message: 'OK', 
                        data: { records, total },  
                        code: 0
                    })
        })
}
function getOne (req, res) {
    var id = req.params.id
    User.findById(id, (err, user) => {
        if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error', error: err })
        if(!user) return res.status(404).send({ done: false, code: 1, message: 'No se encontró usuario'})
        return res.status(200)
                    .send({ done: true, code: 0, data: user, message: 'OK'})
    })
}
function validateUsername (req, res) {
    var username = req.params.username
    var id = req.query.id
    User.findOne({ username: username })
        .where(id ? { _id: { $ne: id }} : {})
        .exec((err, user) => {
            if(err) return res.status(500).send({ done: false, message: 'Ocurrió un error en validación de usuario', code: -1, err: err})
            if(!user) return res.status(200).send({ done: true, message: 'No existe usuario', code: 0, exists: false})
            return res.status(200).send({ done: true, message: 'No existe usuario', code: 0, exists: true})
        })
}
module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    updatePass,
    uploadImage,
    getImageFile,
    getUsers,
    getOne,
    validateUsername
}