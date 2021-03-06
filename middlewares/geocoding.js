'use strict'

const request = require('request')
const config = require('../config')
exports.findCoordFromAddress = function (req, res, next) {
        
        const API_KEY = config.googleApiKey;
        const BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
        const params = req.body
        const address = params.address
        const query = `${address.location}, ${address.city}, ${address.region}, ${config.country}`;
        const url = BASE_URL + query + "&key=" + API_KEY;
    
        request(url, { headers: { 'Content-Type': 'application/json' }}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                const Body = JSON.parse(body)
                const results = Body.results
                if(results) {
                    const first = results[0]
                    if(first) {
                        const geometry = first.geometry
                        const location = geometry.location
                        const placeId = first.place_id
                        req.body.placeId = placeId
                        req.body.coordinates = location
                    } else {
                        req.body.placeId = '000'
                    }                     
                } else {
                    req.body.placeId = '000'
                }
                
                next()
            }
            else {
                // The request failed, handle it
                console.log('No se pudo encontrar coordenadas para la dirección ' + query)
                req.body.placeId = '000'
                console.log('placeid', req.body.placeId)
                next()
            }
        });
    };