'use strict'

var config = require('../../config')
exports.ensureAuth = function(req, res, next) {
    var authorization = req.headers.authorization
    if(!authorization) {
        return res.status(403)
                    .send({
                        message: 'La petición no tiene la cabecera de autenticación'
                    })
    }
    var token = authorization.replace(/['"]+/g, '');
    if(token == config.erpKeyAccess)
        next();
    else 
        return res.status(403)
            .send({
                message: 'La clave de autenticación es inválida'
            })
}

exports.isAdmin = function (req, res, next) {
    if(!req.user.isAdmin)
    {
        return res.status(403)
                    .send({
                        message: 'No tienes permiso para realizar esta acción'
                    })
    }
    next()
}