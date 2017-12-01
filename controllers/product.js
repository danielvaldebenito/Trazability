'use strict'

const Product = require('../models/product')
const ProductType = require('../models/productType')
const Stock = require('../models/stock')
const MovementItem = require('../models/movementItem')
const Warehouse = require('../models/warehouse')
const Vehicle = require('../models/vehicle')
const Address = require('../models/address')
const Store = require('../models/store')
const Decrease = require('../models/decrease')
const InternalProcess = require('../models/internalProcess')
const config = require('../config')
const fs = require('fs')
const path = require('path')
const productService = require('../services/product')
const Excel = require('exceljs')
const pagination = require('mongoose-pagination')
const worksheetName = 'Hoja1'
function getOneByNif (req, res) {
    const nif = req.params.nif
    const limit = req.query.limit || 10
    Product
        .findOne({ $or: [ { nif: nif }, { formatted: nif } ] })
        .populate('productType')
        .exec((err, product) => {
            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar producto', err})
            if(!product) 
                return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe ' + nif})
            
            Stock
                .findOne({ product: product._id })
                .populate({ path: 'warehouse', populate: { path: 'dependence' }})
                .exec((err, stock) => {
                    if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar stock del producto', err})
                    if(!stock) return res.status(404).send({ done: false, code: 1, message: 'El producto existe pero no se encuentra en ninguna bodega existente'})
                    if(!stock.warehouse) return res.status(404).send({ done: false, code: 1, message: 'No se encontró bodega correspondiente.', product})
                    MovementItem
                        .find({ product: product._id })
                        .sort([['createdAt', -1]])
                        .populate({
                            path: 'movement',
                            options: {
                                sort: { 'type': -1 }
                            },
                            populate: [
                                {
                                    path: 'transaction'
                                },
                                {
                                    path: 'warehouse'
                                }
                            ]
                        })
                        
                        .limit(limit)
                        .exec((err, movs) => {
                            if(err) return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al buscar los moviemientos del producto', err})
                            if(!movs) return res.status(404).send({ done: false, code: 1, message: 'El producto buscado no existe'})
                            
                            var promise = getWarehouseByType(stock.warehouse._id)
                            promise
                            .then(response => {
                                res.status(200)
                                .send({
                                    done: true, 
                                    code: 0,
                                    message: 'OK',
                                    data: {
                                        product,
                                        movs,
                                        stock,
                                        response
                                    }
                                })
                                
                            }, error => {
                                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener bodega por tipo', error})
                            })
                            .catch(reason => {
                                return res.status(500).send({ done: false, code: -1, message: 'Ha ocurrido un error al obtener bodega por tipo', reason})
                            })
                            
                })
        })
    })


}
function existsByNif (req, res) {
    const nif = req.params.nif
    Product.findOne({ $or: [{ nif: nif}, {formatted: nif}] }, (err, product) => {
        if(err) return res.status(500).send({ exists: false, message: 'Ha ocurrido un error', err})
        return res.status(200).send({ exists:  product != null })
    })
}
function createFalseNifs (req, res) {
    ProductType.find((err, pts) => {
        if(err) return res.status(500).send({done: false, message: 'Ha ocurrido un error al buscar tipos de producto', err})
        let ids = pts.map((pt, index) => { return pt._id })
        for (let i = 0; i < 100000; i++) {
            let nif = '99-999999-' + i;
            let random = Math.floor(Math.random() * pts.length - 1) + 1
            productService.formatNif(nif)
                .then(formatted => {
                    let productType = ids[random];
                    const product = new Product ({
                        nif: formatted,
                        formatted: formatted,
                        productType: productType,
                        enabled: true,
                        createdByPda: false,
                        createdBy: 'admin' 
                    })
                    product.save((err, saved) => {
                        if(err) return res.status(500).send({ done: false, message: 'Ha ocurrido un error', err})
                        if(i == 99999) {
                            return res.status(200).send({ message: 'OK'})
                        }
                    })
                })
        }
    })
    
}
function getAllProducts (req, res) {
    Product
    .find({ enabled: true })
    .select(['-_id','formatted', 'productType'])
    .populate({ 
        path: 'productType',
        select: ['code']
    })
    .exec((err, products) => {
        res.status(200).send(products)
    })

}
function getAllProductsFormat (req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100000
    Product
        .find({ enabled: true })
        .select(['-_id','formatted', 'productType'])
        .populate({ 
            path: 'productType',
            select: ['code']
        })
        .paginate(page, limit, (err, products, total) => {
            if(err) return res.status(500).send({done: false, message: 'Error al obtener data', err })
            const data = products.map((product, index) => {
                let pt = product.productType
                return product.formatted + '|' + (pt ? pt.code : '') 
            })

            fs.writeFileSync('./uploads/products/products' + page + '.json', JSON.stringify(data))
            return res.status(200).send({ done: true, message: 'OK, archivo escrito'})
        })

}
function getJsonProducts (req, res){
    const page = parseInt(req.params.page)
    const filePath = './uploads/products/products' + page + '.json'
    fs.exists(filePath, (exists) => {
        if(exists) {
            res.setHeader('Content-disposition', 'attachment; filename= products.json');
            res.setHeader('Content-type', 'application/json');
            return res.sendFile(path.resolve(filePath))
        } else {
            return res.status(400).send({message: 'Archivo no existe'})
        }
    })
}
function getWarehouseByType(id) {
    const types = config.entitiesSettings.warehouse.types
    //types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACÉN', 'MERMAS', 'PROCESO_INTERNO']
    let p = new Promise((resolve, reject) => {
        try {
            Warehouse.findById(id, (err, wh) => {
                if(err) reject(err)
                else {
                    const type = wh.type
                    switch (type) {
                        case types[0]: 
                            Vehicle.
                                findOne({ warehouse: id })
                                .populate('distributor')
                                .exec((err, vehicle) => {
                                    if (err) {
                                        console.log(err);
                                        reject(err)
                                    }
                                    
                                    if(!vehicle) reject ('No se encontró vehículo para la bodega de tipo vehículo')
                                    return resolve({ type, vehicle})
                                })
                        break;
                        case types[1]: 
                            Address
                            .findOne({ warehouse: id })
                            .populate('client')
                            .exec((err, address) => {
                                if(err) {
                                    console.log(err);
                                    reject(err)
                                }
                                
                                if(!address) reject('No se encontró dirección para la bodega de tipo dirección')
                                resolve({ type, address})
                            })
                        break;
                        case types[2]: 
                            Store
                                .findOne({ warehouse: id })
                                .populate('dependence')
                                .exec((err, store) => {
                                    if(err) {
                                        console.log(err);
                                        reject(err)
                                    }
                                    
                                    if(!store) reject('No se encontró almacén para la bodega de tipo almacén')
                                    resolve({ type, store})
                            })
                        break;
                        case types[3]: 
                            Decrease.findOne({ warehouse: id }, (err, decrease) => {
                                if(err) {
                                    console.log(err);
                                    reject(err)
                                }
                                
                                if(!decrease) reject('No se encontró bodega de mermas para la bodega de tipo mermas')
                                resolve(decrease)
                            })
                        break;
                        case types[4]: 
                            InternalProcess
                            .findOne({ warehouse: id })
                            .populate('dependence')
                            .populate('internalProcessType')
                            .exec((err, internalProcess) => {
                                if(err) {
                                    console.log(err);
                                    reject(err)
                                }
                                
                                if(!internalProcess) reject('No se encontró bodega de procesos internos para la bodega de tipo procesos internos')
                                resolve({ type, internalProcess})
                            })
                        break;
                        default: reject('El tipo de bodega no corresponde')
                    }
                }
            })
        } catch (err) {
            console.log(err);
            reject(err)
        }

        
    })
    
   return p;
}
function importProducts (req, res) {
    if(req.files) {
        const file_path = req.files.file.path
        const file_split = file_path.split('\\')
        const file_name = file_split[2]
        const ext_split = file_name.split('\.')
        const file_ext = ext_split[1]
        const extensionsAllowed = ['xls', 'xlsx']
        if(extensionsAllowed.indexOf(file_ext) == -1) {
            return res.status(404)
                .send({
                    message: 'La extensión del archivo no es válida'
                })
        }
        readExcelProducts(file_name)
            .then((rowCount) => {
                setTimeout(() => {
                    fs.unlink(__dirname + '/../uploads/products/' + file_name, (err) => {
                        if(err)
                            console.log(err)
                        console.log('deleted', file_name)
                    })
                }, 60000);
                return res.status(200).send({ done: true, message: 'Archivo subido exitosamente con ' + rowCount + ' registros.'})
            }, rejected => {
                return res.status(404).send({ done: false, message: rejected })
            })
        
    } else {
        return res.status(404)
                    .send({ done: false, message: 'No vienen archivos para importar'})
    }
}

function readExcelProducts (file_name) {
    return new Promise((resolve, reject) => {
        const workbook = new Excel.Workbook();
        workbook.xlsx.readFile(__dirname + '/../uploads/products/' + file_name)
            .then(() => {
                const worksheet = workbook.getWorksheet(worksheetName);
                if(!worksheet) return reject('No se encontró una hoja con el nombre ' + worksheetName)

                worksheet.spliceRows(1, 1);
                let rowCount = worksheet.rowCount;
                console.log('rowCount', rowCount)
                let count = 0;
                worksheet.eachRow({ includeEmpty: false}, (row, rowNumber) => {
                    
                    let capacity = row.getCell(1).value;
                    let nif = row.getCell(2).value.toString();
                    let fila = { capacity, nif }
                    
                    saveProductFromExcelFile(fila)
                        .then(prod => {
                            count++;
                            console.log('agregado producto', prod, count)
                        }, onrejected => {
                            reject('on reject ' + onrejected)
                        })
                    
                });
                resolve(rowCount)
            }, onrejected => {
                reject('on rejected' + onrejected)
            })
            .catch((error) => {
                reject('on error' + error)
            });
    })
    
}
function saveProductFromExcelFile (row) {
    return new Promise((resolve, reject) => {
        getProductTypeFromCapacity(row.capacity)
        .then((pt) => {
            const product = {
                nif: row.nif,
                formatted: row.nif,
                productType: pt._id,
                createdByPda: false,
                createdBy: 'admin',
                enabled: true
            }
            Product.findOneAndUpdate({ $or: [ { nif: row.nif },{ formatted: row.nif }] }, 
                    product, 
                    { upsert: true, new: true, projection: { _id: true } }, 
                    (err, prod) => {
                        if(err) reject(err)
                        resolve(row.nif)
                    })
        }, rejected => reject(rejected))
    })
}
function getProductTypeFromCapacity (capacity) {
    return new Promise((resolve, reject) => {
        ProductType.findOne({ capacity: capacity }, (err, pt) => {
            if(err) reject(err)
            if(!pt) reject(pt)
            resolve(pt)
        })
    })
}
module.exports = { 
    getOneByNif, 
    existsByNif, 
    createFalseNifs, 
    getAllProducts, 
    getAllProductsFormat,
    getJsonProducts,
    importProducts
}