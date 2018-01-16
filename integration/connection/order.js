
'use strict'

const soap = require('soap')
var apiWSDL = __dirname + '/../wsdl/sfdcPartner.wsdl';
const createOrderWsdl = __dirname + '/../wsdl/creaPedido_ws.wsdl'
const changeStatus = __dirname + '/../wsdl/cambioEstadoPedido.wsdl'
const loginService = require('../connection/login')
const Order = require('../../models/order')
const Client = require('../../models/client')
const config = require('../../config')
const Enumerable = require('linq')
const ProductType = require('../../models/productType')
function createOrder(order, sessionId) {
    const p = new Promise(function(resolve, reject) {
    
        soap.createClient(createOrderWsdl, function(err, client) {
            if(err) throw new Error(err);
            const sHeader = { SessionHeader: { sessionId: sessionId }};
            client.addSoapHeader(sHeader, '', 'tns', '')
            
            const args = {
                clienteExiste: order.client.erpId ? 'SÍ' : 'NO',
                tipoCuenta: 'Cuenta Empresas',
                nombreCliente: order.client.name,
                apellidosCliente: order.client.surname,
                tipoDocumentoCta: 'Cédula de ciudadanía',
                noDocumento: order.client.nit,
                idSalesforceCta: order.client.erpId || null, // 0010x000002IS9y
                direccionCta: order.address.location ? order.address.location.toUpperCase() : '',
                departamentoCta: order.address.region ? replaceTildes(order.address.region.toUpperCase()) : '', // SIN TILDES
                ciudadCta: order.address.city ? replaceTildes(order.address.city.toUpperCase()) : '', // SIN TILDES
                TelefonoCta: order.phone,
                noPedidoBO: order.orderNumber.toString(),
                tipoPedido: order.type == 'ENVASADO' ? 'Cilindro Individual' : 'Granel',
                POS: order.device ? order.device.pos : '', // esn * para pruebas usar pos006
                placaVehiculo: order.vehicle ? order.vehicle.licensePlate : '',
                Producto1: order.items[0].productType.code2,
                CantidadProducto1: order.items[0].quantity,
                ValorUnitarioP1: order.items[0].price,
                ValorNegociableP1: order.items[0].negotiable,
                TotalP1: 0,
                Producto2: order.items[1] ? order.items[1].productType.code2 : '',
                CantidadProducto2: order.items[1] ? order.items[1].quantity : 0,
                ValorUnitarioP2: order.items[1] ? order.items[1].price : 0,
                ValorNegociableP2: order.items[1] ? order.items[1].negotiable : 0,
                TotalP2: 0,
                Producto3: order.items[2] ? order.items[2].productType.code2 : '',
                CantidadProducto3: order.items[2] ? order.items[2].quantity : 0,
                ValorUnitarioP3: order.items[2] ? order.items[2].price : 0,
                ValorNegociableP3: order.items[2] ? order.items[2].negotiable : 0,
                TotalP3: 0,
                Producto4: order.items[3] ? order.items[3].productType.code2: '',
                CantidadProducto4: order.items[3] ? order.items[3].quantity : 0,
                ValorUnitarioP4: order.items[3] ? order.items[3].price : 0,
                ValorNegociableP4: order.items[3] ? order.items[3].negotiable : 0,
                TotalP4: 0,
                Importe: 0,
                Observacion: 'Sin observaciones'
            }
            let list = [];
            list.push(args)
            const send = {
                invoiceList: list
            }
            console.log('send: ', JSON.stringify(send))
            client.creaPedido_mtd({ strIdPedido: JSON.stringify(send)}, (err, respuesta) => {
                console.log({err, respuesta})

                if(err) {
                    reject(err)
                } else {
                    if(respuesta) {
                        let result = respuesta.result;
                        let jsonResult = JSON.parse(result);
                        console.log(jsonResult)
                        if(jsonResult.estadoTransaccion == 'Fallido') {
                            reject('Fallido')
                        } else if (jsonResult.estadoTransaccion == 'Exitoso') {
                            const idClienteSF = jsonResult.idClienteSF
                            const idPedidoSF = jsonResult.idPedidoSF
                            const noPedidoSF = jsonResult.noPedidoSF
                            let promise = updateOrderFromSalesForce(order._id, idPedidoSF, noPedidoSF)
                            
                            promise.then(() => {
                                if(idClienteSF) {
                                    updateClientFromSalesForce(order.client._id, idClienteSF).then(() => {
                                        resolve('Pedido y Cliente Actualizado')
                                    })
                                } else {
                                    resolve('Pedido Actualizado')
                                }
                                
                            })
                        } else {
                            reject('Respuesta desconocida')
                        }
                    }
                }
            });
        }); 

    });

    return p;

}

function changeState(order, sessionId, state, reason, itemsSale) {
    return new Promise ((resolve, reject) => {
        if(!order.erpUpdated) {
            reject('No se ha informado pedido')
        }
       
        soap.createClient(changeStatus, (err, client) => {
            if(err) reject(err)
            const sHeader = { SessionHeader: { sessionId: sessionId }};
            client.addSoapHeader(sHeader, '', 'tns', '')
            // {"invoiceList":[{"idSalesforce":"0060x000001reYN","noPedido":"151486","Estado":"Notificado al Conductor"}]}
            let existsReason
            if(reason) {
                const reasons = config.entitiesSettings.order.reasons;
                existsReason = Enumerable.from(reasons)
                                        .where(w => { return w.toLowerCase() == reason.toLowerCase() })
                                        .firstOrDefault();
            }
            let jsonDetail = [
                { product: null, quantity: 0 },
                { product: null, quantity: 0 },
                { product: null, quantity: 0 },
                { product: null, quantity: 0 }
            ]
            if(itemsSale) {
                let index = 0
                itemsSale.forEach((item, i) => {
                    
                    getProductTypeById(item.productType)
                        .then(pt => {
                            index++
                            jsonDetail[i].product = pt.code2
                            jsonDetail[i].quantity = item.quantity
                            if(itemsSale.length && itemsSale.length == index) {
                                sendChangeStatus(order, state, existsReason, jsonDetail)
                                    .then(r => resolve())

                            }
                        })
                });
            } else {
                sendChangeStatus(order, state, existsReason, jsonDetail)
                    .then(r => resolve());
            }
            
        })
    })
}

function sendChangeStatus(order, state, existsReason, jsonDetail) {
    return new Promise((resolve, reject) => {
        const args = { 
            idSalesforce: order.erpId, 
            noPedido: order.erpOrderNumber, 
            Estado: state, 
            Razon: existsReason || '',
            Producto1: jsonDetail[0].product,
            CantidadEntregadaP1: jsonDetail[0].quantity,
            Producto2: jsonDetail[1].product,
            CantidadEntregadaP2: jsonDetail[1].quantity,
            Producto3: jsonDetail[2].product,
            CantidadEntregadaP3: jsonDetail[2].quantity,
            Producto4: jsonDetail[3].product,
            CantidadEntregadaP4: jsonDetail[3].quantity
        };
    
        let array = []
        array.push(args)
        let send = { invoiceList: array }
        console.log('send', send)
        client.cambioEtapaPedido_mtd({ strIdPedido: JSON.stringify(send) }, (err, ok) => {
            if(err) reject(err)
            resolve(ok)
        })
    })
}


function updateOrderFromSalesForce (idOrder, idPedidoSF, noPedidoSF) {
    return new Promise ((resolve, reject) =>  {
        Order.findByIdAndUpdate(idOrder, 
            { 
                erpId: idPedidoSF,
                erpOrderNumber: noPedidoSF,
                erpUpdated: true
            }, (err, done) => {
                if(err) reject(err)
                resolve()
            })
    })
}
function updateClientFromSalesForce(id, idsf) {
    return new Promise((resolve, reject) => {
        Client.findByIdAndUpdate(id, { erpId: idsf }, (err, client) => {
            if(err) reject (err)
            resolve()
        })
    })
}
function replaceTildes(str) {
    return str.replace('á', 'a')
            .replace('é', 'e')
            .replace('í', 'i')
            .replace('ó', 'o')
            .replace('ú', 'u')
            .replace('Á', 'A')
            .replace('É', 'E')
            .replace('Í', 'I')
            .replace('Ó', 'O')
            .replace('Ú', 'U')

}
function getProductTypeById(id) {
    return new Promise((resolve, reject) => {
        ProductType.findById(id, (err, pt) => {
            if(err) reject(err)
            resolve(pt)
        });
    }) 
}


module.exports = { createOrder, changeState }