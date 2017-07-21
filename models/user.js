'use strict'
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var config = require ('../config');
var roles = config.entitiesSettings.user.roles;
var Schema = mongoose.Schema
var UserSchema = Schema({
    name: { type: String, required: true },
    surname: String,
    email: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: String,
    isAdmin: { type: Boolean, default: false },
    distributor: { type: Schema.Types.ObjectId, ref: 'Distributor' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    device: { type: Schema.Types.ObjectId, ref: 'Device' },
    lastLogin: Date,
    rol: { type: String, enum: roles }
})
UserSchema.plugin(timestamp)
module.exports = mongoose.model('User', UserSchema)