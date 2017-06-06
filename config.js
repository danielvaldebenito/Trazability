module.exports = {
    database: {
        name: 'trazability',
        port: process.env.PORT_DATABASE || 27017,
        server: 'localhost'
    },
    entitiesNames: {
        distributor: {
            singular: 'contratista',
            plural: 'contratistas'
        },
        zone: {
            singular: 'zona',
            plural: 'zonas'
        }
        
    }
}