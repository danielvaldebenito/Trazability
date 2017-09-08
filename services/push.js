var admin = require("firebase-admin");
var mongoose = require('mongoose')
var Device = require('../models/device');

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

function send(token, payload) {
    console.log('Sending push notification to token', token)
    //token = 'ej_707oURzc:APA91bHJeVqT1W-YIJyJySb5ofPFfPeRIR2gtcu3fgtllHHER5ldhWnjKnhrIiFW4n1IPUsH61DU8nIqOSWmkFiytUlwRKGR4SpkR2EUD3lr3nIfVpzktYoK7S6hdF4hf2Aw_BCRa4l5'
    admin
        .messaging()
        .sendToDevice(token, payload)
        .then(function (response) {
            console.log("Successfully sent message:", response);
        })
        .catch(function (error) {
            console.log("Error sending message:", error);
        });
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

module.exports = {
    requestGeoreference, test
}