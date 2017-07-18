module.exports = {
    secretjwt: 'commzgate1548',
    daysExpToken: 30,
    autocreateDecreaseWarehouse: true,
    googleApiKey: 'AIzaSyCdo5HgF-LydsGMOxv4QEuSo9G24DlfgDU',
    database: {
        name: 'trazability',
        port: process.env.PORT_DATABASE || 27017,
        server: 'localhost'
    },
    entitiesSettings: {
        document: {
            types: ['FACTURA', 'GUÍA DE DESPACHO', 'ORDEN DE COMPRA']
        },
        inventoryAdjustment: {
            reasons: ['MOTIVO 1', 'MOTIVO 2']
        },
        order: {
            types: ['ENVASADO', 'GRANEL'],
            status: ['RECIBIDO', 'ASIGNADO', 'EN RUTA', 'ENTREGADO', 'CANCELADO'],
            reasons: ['PICO','ZORRA','CULO']
        },
        sale: {
            types: ['POR PEDIDO', 'CAMPANEO'],
            paymentMethods: ['EFECTIVO', 'DÉBITO', 'CRÉDITO']
        },
        settings: {
            keys: ['Alguna Configuración', 'Otra configuración']
        },
        transaction: {
            types: ['VENTA', 'AJUSTE', 'DEVOLUCIÓN']
        },
        vehicle: {
            types: ['ENVASADO', 'GRANEL']
        },
        warehouse: {
            types: ['VEHÍCULO', 'DIRECCION_CLIENTE', 'ALMACÉN', 'MERMAS', 'PROCESO_INTERNO']
        }
    }
}