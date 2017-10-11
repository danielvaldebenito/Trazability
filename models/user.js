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
    password: { type: String },
    tempPassword: String,
    image: String,
    isAdmin: { type: Boolean, default: false },
    distributor: { type: Schema.Types.ObjectId, ref: 'Distributor' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    device: { type: Schema.Types.ObjectId, ref: 'Device' },
    lastLogin: Date,
    roles: [{ type: String, enum: roles }],
    dependence: {type: Schema.Types.ObjectId, ref: 'Dependence'},
    internalProcessTypes: [{ type: Schema.Types.ObjectId, ref: 'InternalProcessType'}],
    internalProcess: [{ type: Schema.Types.ObjectId, ref: 'InternalProcess'}],
    online: Boolean
})
UserSchema.plugin(timestamp)
module.exports = mongoose.model('User', UserSchema)

UserSchema.post('save', () => {

})