var admin = require("firebase-admin");
var mongoose = require('mongoose')
var Device = require('../models/device');
var Vehicle = require('../models/vehicle')
var User = require('../models/user')
function requestGeoreference(distributor, requestId) {
    // This registration token comes from the client FCM SDKs.
    Device
        .find()
        .populate({
            path: 'user',
            populate: {
                path: 'distributor',
                match: { '_id': new mongoose.Types.ObjectId(distributor) }
            }
        })
        .exec((err, devices) => {
            if (!err) {
                var registrationTokens = [];
                devices.forEach(d => {
                    if (d.token)
                        registrationTokens.push(d.token);

                })
                if (registrationTokens.length > 0) {
                    var payload = {
                        data: {
                            key: 'GEO_REQUEST',
                            requestId: requestId
                        },
                        notification: {
                            title: 'Hola Seba',
                            message: 'Si te llegó esto, avísame plis'
                        }
                    };
                    send(registrationTokens, payload);
                }
            }
        })
}

function newOrderAssigned (vehicle, order) {
    Vehicle.findById(vehicle, (err, found) => {
        if(err) return console.log('Error al buscar vehiculo' + vehicle, err)
        if(!found) return console.log('No se encontró vehículo', vehicle)
        if(!found.user) return console.log('Vehículo no tiene usuario asignado', found)
        User.findById(found.user, (err, foundUser) => {
            if (err) return console.log('Error al buscar usuario' + found.user, err)
            if (!foundUser) return console.log('No se encontró usuario', found.user)
            if (!foundUser.device) return console.log('Usuario no tiene dispositivo asignado', foundUser)
            Device.findById(foundUser.device, (err, foundDevice) => {
                if (err) return console.log('Error al buscar dispositivo' + foundUser.device, err)
                if (!foundDevice) return console.log('No se encontró dispositivo', foundUser.device)
                if (!foundDevice.token) return console.log('Dispositivo no tiene token asociado', foundDevice)

                var payload = {
                    data: {
                        key: 'ASSIGN_ORDER',
                        order: order
                    }
                }
                send(foundDevice.token, payload);
            })
        })
    })
}

function test(token) {
    //var token = 'ej_707oURzc:APA91bHJeVqT1W-YIJyJySb5ofPFfPeRIR2gtcu3fgtllHHER5ldhWnjKnhrIiFW4n1IPUsH61DU8nIqOSWmkFiytUlwRKGR4SpkR2EUD3lr3nIfVpzktYoK7S6hdF4hf2Aw_BCRa4l5'
    
    var payload = {
        data: {
            key: 'GEO_REQUEST',
            requestId: '1'
        },
        notification: {
            title: 'Hola',
            message: 'Si te llegó esto, avísame plis'
        }
    }
    return admin
        .messaging()
        .sendToDevice(token, payload)
        
}

function cancelOrder(device, id) {
    Device.findById(device, (err, stored) => {
        if(err) return console.log('Error al buscar device ' + id)
        if(stored && stored.token) {
            var payload = {
                data: {
                    key: 'CANCEL_ORDER',
                    id: id
                }
            }
            send(stored.token, payload)
        }
    })
}

function send(token, payload) {
    console.log('Sending push notification to token', token)
    return admin
        .messaging()
        .sendToDevice(token, payload)

}
module.exports = {
    requestGeoreference, test, send, newOrderAssigned
}