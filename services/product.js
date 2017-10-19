'use strict'

function formatNif(nif) {
    return new Promise((resolve, reject) => {
        try {
            let session = nif.split('-')
            const format = [2, 6, 6]
            for(let i=0; i < session.length; i++) {
                while(session[i].length < format[i]) {
                    session[i] = '0' + session[i]
                }
            }
            console.log('session', session)
            resolve(session.join('-'))
    
        } catch (e) {
            reject(e)
        }
        
    })
}
module.exports = { formatNif }