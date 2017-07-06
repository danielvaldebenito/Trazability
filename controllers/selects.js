'use strict'
var config = require('../config');

// .../api/select/vehicleTypes
function getvehicleTypes (req, res) {
    var types = config.entitiesSettings.vehicle.types;
    return res
        .status(200)
        .send({
            data: types
        })
}

module.exports = {
    getvehicleTypes
}