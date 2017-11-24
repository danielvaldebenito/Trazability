'use strict'

const moment = require('moment')
const minDate = moment("2017-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss")
function convertDate(dateStr, type, format) {
    let date;
    switch(type) {
        case 'from':
            date = !dateStr || dateStr == 'null' || !moment(dateStr, format).isValid() 
                    ? minDate 
                    : moment(dateStr, format);
        break;
        case 'to':
            dateStr + ' 23:59:59'
            date = !dateStr || dateStr == 'null' || !moment(dateStr, format).isValid()
                ? moment() 
                : moment(dateStr, format)
        break;
    }
    return date;
}
function convertDateRange(dateArr, format) {
    let from = dateArr[0]
    let to = dateArr[1] + ' 23:59:59'

    let date1 = !from || from == 'null' || !moment(from, format).isValid() 
    ? minDate.toDate()
    : moment(from, format).toDate();
    
    format = format + ' HH:mm:ss'
    let date2 = !to || to == 'null' || !moment(to, format + ' HH:mm:ss').isValid()
    ? from 
        ? moment(from + ' 23:59:59', format).toDate()
        : moment().toDate()
    : moment(to, format + ' HH:mm:ss').toDate()

    return [date1, date2];
}
module.exports = { convertDate, convertDateRange }