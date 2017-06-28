'use strict'
var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'commzgate1548'

exports.ensureAuth = function(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(403)
                    .send({
                        message: 'La petición no tiene la cabecera de authentication'
                    })
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    var payload;
    try {
        payload = jwt.decode(token, secret);
        if(payload.exp <= moment.unix()) {
            return res.status(401)
                        .send({message: 'Token ha expirado'})
        }
    } catch (ex) {
        return res.status(404)
                    .send({
                        message: 'Ha ocurrido un error. Token no válido'
                    })
    }
    req.user = payload;
    next();
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