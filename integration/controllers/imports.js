'use strict'
const Excel = require('exceljs')
const Client = require('../../models/client')
const Distributor = require('../../models/distributor')
const logger = require("./../../logger");
//const stream = require('stream')
const fs = require('fs')
const moment = require('moment')
const ProductType = require('../../models/productType')
const config = require('../../config')
let productTypes = [];
const Enumerable = require('linq')
const timeinterval = config.integration.imports.interval
const startHour = config.integration.imports.start;
const endHour = config.integration.imports.end;
const distributorFilename = 'contratistaUnigas.csv'
const clientFilename = 'cuentaUnigas.csv'

getProductTypes()
    .then(pts => {
        productTypes = pts
    }, rej => {
        console.log('Error: ' + rej)
    })
const mainFunction = () => {
    setInterval(() => {
        let hour = moment().hour();
        if(hour >= startHour && hour <= endHour) {
            readClientCsvFile();
            readContratistaCsvFile();
        } else {
            logger.info('Aún no es hora para las importaciones', hour)
        }
    }, timeinterval)
}
const readClientCsvFile = () => {
    fs.exists(__dirname + '/../../../IntegracionSaleForce/' + clientFilename, (exists) => {
        if(exists) {
            const workbook = new Excel.Workbook();
            const options = {
                bufferSize: 1, 
                start: 1,
                encoding: 'utf-8'
            }
            const stream = fs.createReadStream(__dirname + '/../../../IntegracionSaleForce/' + clientFilename, options)
            stream.pipe(workbook.csv.createInputStream())
                .on('data', (data) => {
                    if(data[0] != 'ID"') {
                        let discountSurcharges = []
                        let discountK9 = data[39];
                        let discountK15 = data[27];
                        let discountK18 = data[30];
                        let discountK35 = data[33];
                        let discountK45 = data[36];
                        let discountGranel = data[42];
                        let discountArray = [
                            { key: 'K9', discount: discountK9 },
                            { key: 'K15', discount: discountK15 },
                            { key: 'K18', discount: discountK18 },
                            { key: 'K35', discount: discountK35 },
                            { key: 'K45', discount: discountK45 },
                            { key: 'GRANEL', discount: discountGranel }
                        ];
                        for(let i = 0; i < discountArray.length; i++) {
                            if(discountArray[i].discount != '' && discountArray[i].discount != '0.0') {
                                let pt = Enumerable.from(productTypes)
                                                    .where(w => { return w.code2 == discountArray[i].key })
                                                    .firstOrDefault()
                                if(pt != null) {
                                    discountSurcharges.push({
                                        productType: pt._id,
                                        isDiscount: true,
                                        value: parseFloat(discountArray[i].discount)
                                    })
                                }
                            }
                        }
                        
                        let client = {
                            nit: data[2],
                            name: data[1],
                            surname: '',
                            phone: data[10],
                            email: data[12],
                            contact: '',
                            completeName: data[1],
                            discountSurcharges: discountSurcharges,
                            addresses: [{
                                location: data[5],
                                city: data[23] == '' ? null : data[23].indexOf('/') > -1 ? data[23].split('/')[0] : null,
                                region: data[23] == '' ? null : data[23].indexOf('/') > -1 ? data[23].split('/')[1] : null
                            }],
                            erpId: data[0]
                        }
                        saveClientFromCsvFile(client)
                            .then(c => console.log('cliente creado', c._id))
                    }
                })
                .on('finish', () => {
                    logger.info('Archivo de cliente cargado correctamente')
                    fs.rename(__dirname + '/../../../IntegracionSaleForce/cuentaUnigas.csv', __dirname + '/../../../IntegracionSaleForce/backup/cuentaUnigas.csv', (err) => {
                        if(err) logger.info('Archivo de cliente movido al backup')
                    })
                })
        } else {
            logger.error('Archivo de cliente no existe')
        }
    })
}

const readContratistaCsvFile = () => {
    fs.exists(__dirname + '/../../../IntegracionSaleForce/' + distributorFilename, (exists) => {
        if(exists) {
            const workbook = new Excel.Workbook();
            const options = {
                bufferSize: 1, 
                start: 1,
                encoding: 'utf-8'
            }
            const stream = fs.createReadStream(__dirname + '/../../../IntegracionSaleForce/' + distributorFilename, options)
            stream.pipe(workbook.csv.createInputStream())
                .on('data', (data) => {
                    if(data[0] != 'ID"' && data[0] != '') {
                        let distributor = {
                            name: data[1],
                            nit: data[2],
                            email: data[3],
                            contact: '',
                            phone: data[8],
                            address: data[5],
                            city: data[18],
                            region: '', // FIXME: pedir que agreguen departamento
                            tutorial: Boolean,
                            deliveryLocations: [
                                {
                                    region: '',
                                    city: data[18]
                                }
                            ]
                        }
                        saveDistributorFromCsvFile(distributor)
                            .then(d => logger.info('Contratista creado ' + d._id),
                                e => logger.error('Error: ' + e)
                            )
                    }
                })
                .on('finish', () => {
                    logger.info('Archivo de contratista cargado correctamente')
                    fs.rename(__dirname + '/../../../IntegracionSaleForce/contratistaUnigas.csv', __dirname + '/../../../IntegracionSaleForce/backup/contratistaUnigas.csv', (err) => {
                        if(err) logger.info('Archivo de contratista movido al backup')
                    })
                })
        } else {
            logger.error('Archivo de contratista no existe')
        }
    })
}
const saveClientFromCsvFile = (client) => {
    return new Promise((resolve, reject) => {
        Client.findOneAndUpdate({ nit: client.nit }, client, { upsert: true, new: true, project: { _id: true } }, (err, doc) => {
            if(err) reject(err)
            resolve(doc)
        })
    })
    
}
const saveDistributorFromCsvFile = (distributor) => {
    return new Promise((resolve, reject) => {
        Distributor.findOneAndUpdate({ nit: distributor.nit }, distributor, { upsert: true, new: true, project: { _id: true } }, (err, doc) => {
            if(err) reject(err)
            resolve(doc)
        })
    })
    
}
function getProductTypes  ()  {
    return new Promise((resolve, reject) => {
        ProductType
            .find()
            .exec((err, pt) => {
                if(err) reject(err)
                resolve(pt)
            })
    })
}
module.exports = { mainFunction }