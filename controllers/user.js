'use strict'
var fs = require('fs')
var path = require('path')
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user')
var jwt = require('../services/jwt')
var moment = require('moment')
var config = require('../config')

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
    user.name = params.name
    user.surname = params.surname
    user.email = params.email
    user.isAdmin = params.isAdmin
    user.distribuidor = params.distribuidor
    user.username = params.username
    user.image = null
    
    if(params.password) {
        // Encriptar contraseña y guardar datos
        bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash
            if(user.name != null && user.surname != null && user.email != null){
                // Guardar usuario
                user.save((err, stored) => {
                    if(err){
                        res
                        .status(500)
                        .send({ done: false, message: 'Ha ocurrido un error al guardar' })
                    } else {
                        if(!stored) {
                            res
                            .status(404)
                            .send({ done: false, message: 'No se pudo guardar el usuario' })
                        } else {
                            res
                            .status(200)
                            .send({ done: true, message: 'Usuario guardado', stored: stored})
                        }  
                    }
                })
            } else {
                res
                .status(200)
                .send({ done: false, message: 'Complete los campos requeridos'})
            }
        })
    } else {
        res
        .status(500)
        .send({
            done: false,
            message: 'Introduce la contraseña'
        })
    }
}
function loginUser (req, res) {
    
    var params = req.body
    var username = params.username
    var password = params.password
    User.findOne({username: username}, (err, user) => {
        if(err) {
            res.status(500)
                .send({message: 'Error en la petición'})
        } else {
            if(!user) {
                res.status(404)
                    .send({message: 'El usuario no existe'})
            } else {
                // Comprobar contraseña
                console.log('comparando: ', user)
                bcrypt.compare(password, user.password, (error, check) => {
                    if(error) return res.status(500).send({ message: 'Ocurrió un error', error: error })
                    if(check) {
                        // devolver los datos del usuario logueado
                        user.lastLogin = moment.unix()
                        res.status(200)
                            .send({user: user, token: jwt.createToken(user)}) 
                    } else {
                        var pass = bcrypt.hashSync(password)
                        res.status(404)
                        .send({message: 'El usuario no ha podido loguearse'})
                    }
                })
            }
        }
    })
}
function updateUser(req, res) {
    var userId = req.params.id
    var update = req.body
    User.findByIdAndUpdate(userId, update, (err, updated) => {
        if(err) {
            res.status(500)
                .send({message: 'Error al actualizar el registro'})
        } else {
            if(!updated)
            {
                res.status(404)
                    .send({message: 'No se ha podido actualizar'})
            } else {
                res.status(200)
                    .send({message: 'Datos actualizados', updated: updated})
            }
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
        var extensionsAllowed = ['png', 'jpg']
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
module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
}