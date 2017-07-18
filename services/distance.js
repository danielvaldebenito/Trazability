var distance = require('google-distance-matrix');
var config = require('../config')
// var origins = ['San Francisco CA', '40.7421,-73.9914'];
// var destinations = ['New York NY', 'Montreal', '41.8337329,-87.7321554', 'Honolulu'];

distance.key(config.googleApiKey);
distance.units('metric');

function getMinorDistance (origins, destinations, res) {
    var dest = [];
    destinations.forEach(g => {
        dest.push(g.lat + ',' + g.lng);
    })
    distance.matrix(origins, destinations, function (err, distances) {
        if (err) 
            return res.status(500).send({ done: false, message: 'Error',  code: -1, error: error });
        if(!distances)
            return res.status(404).send({ done: false, message: 'No se encontró distancias',  code: 1 });
        var minorIndex = calculateDistance(distances, origins.length, destinations.length);
        if(minorIndex < 0) 
            return res.status(200).send({ done: false, message: 'No se encontraron registros',  code: 2 });
        else 
            return res.status(200).send({ done: true, message: 'OK',  code: 0, minorDistance: destinations[minorIndex] });            
    });
}

function calculateDistance (distances, oLength, dLength) {
    var minor = 9999999999999;
    var minorIndex = -1;
    if (distances.status == 'OK') {
        for (var i=0; i < oLength; i++) {
            for (var j = 0; j < dLength; j++) {
                var origin = distances.origin_addresses[i];
                var destination = distances.destination_addresses[j];
                if (distances.rows[0].elements[j].status == 'OK') {
                    var distance = distances.rows[i].elements[j].distance.text;
                    var value = distances.rows[i].elements[j].distance.value;
                    if(minor > value) {
                        minor = value;
                        minorIndex = j
                    }
                        
                } else {
                    console.log(destination + ' is not reachable by land from ' + origin);
                }
            }
        }
    }
    return minorIndex;
}

module.exports = {
    getMinorDistance
}