module.exports = {
    secretjwt: 'commzgate1548',
    daysExpToken: 30,
    database: {
        name: 'trazability',
        port: process.env.PORT_DATABASE || 27017,
        server: 'localhost'
    },
    entitiesNames: {
        distributor: {
            singular: 'contratista',
            plural: 'contratistas',
            gender: 'F'
        },
        zone: {
            singular: 'zona',
            plural: 'zonas',
            gender: 'F'
        },
        user: {
            singular: 'usuario',
            plural: 'usuarios',
            gender: 'M'
        }
        
    }
}