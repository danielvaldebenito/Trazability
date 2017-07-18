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
module.exports = {
    requestGeoreference
}