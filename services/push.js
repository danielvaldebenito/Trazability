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
                        }
                    };
                    send(registrationTokens, payload);
                }
            }
        })
}

function newOrderAssigned (device, order) {
    Device.findById(device, (err, foundDevice) => {
        if (err) return console.log('Error al buscar dispositivo' + device, err)
        if (!foundDevice) return console.log('No se encontró dispositivo', device)
        if (!foundDevice.token) return console.log('Dispositivo no tiene token asociado', foundDevice)

        var payload = {
            data: {
                key: 'NEW_ORDER',
                id: order.toString()
            }
            // notification: {
            //     title: 'Nueva Orden',
            //     body: 'Se ha asignado una nueva orden a su vehículo'
            // }
        }
        send(foundDevice.token, payload);
    })

}
function forceResetVehicle (device) {
    Device.findById(device, (err, foundDevice) => {
        if (err) return console.log('Error al buscar dispositivo' + device, err)
        if (!foundDevice) return console.log('No se encontró dispositivo', device)
        if (!foundDevice.token) return console.log('Dispositivo no tiene token asociado', foundDevice)

        var payload = {
            data: {
                key: 'RESET_VEHICLE'
            }
            // notification: {
            //     title: 'Nueva Orden',
            //     body: 'Se ha asignado una nueva orden a su vehículo'
            // }
        }
        send(foundDevice.token, payload);
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

function cancelOrder(device, id, orderNumber, confirm) {
    console.log(device, id, orderNumber)
    Device.findById(device, (err, stored) => {
        if(err) return console.log('Error al buscar device ' + id)
        if(stored && stored.token) {
            var payload = {
                data: {
                    key: 'CANCEL_ORDER',
                    id: id,
                    orderNumber: orderNumber.toString(),
                    confirm: confirm
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
    requestGeoreference, test, send, newOrderAssigned, cancelOrder,
    forceResetVehicle
}