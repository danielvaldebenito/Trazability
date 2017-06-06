'use strict'
var jwt = require('jwt-simple')
var moment = require('moment')
var config = require('../config')
var secret = config.secretjwt
var daysExpToken = config.daysExpToken

function createToken(user) {
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        username: user.username,
        iat: moment().unix(),
        exp: moment().add(daysExpToken, 'days').unix()
    }
    return jwt.encode(payload, secret);
}
module.exports = {
    createToken
}