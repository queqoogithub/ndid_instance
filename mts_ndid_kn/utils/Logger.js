import fs from 'fs'

// Todo --> 1) push jsonData / day (format: ddmmyy.json)
//          2) update with -> @idps_list
//                            @verify_data
//                            @check_status

var date = new Date(Date.now()),
    d = '' + (date.getDate()),
    m = '' + (date.getMonth() + 1), 
    y = '' + (date.getFullYear());

if (m.length < 2) m = '0' + m;
if (d.length < 2) d = '0' + d;

const headName = [y, m, d].join('-');

// if (!fs.existsSync(`./loggers/${headName}`)){
//     fs.mkdirSync(`./loggers/${headName}`);
// }

export const userIdpsAndAsLogging = async(updatedJSON) => {
    fs.appendFile(`./loggers/${headName}_check_idps.txt`, JSON.stringify(updatedJSON) + ',' , (err) => {
        if(err) console.log('Error writing file:', err);
    })
    console.log('AS update log with: ', updatedJSON)
}

export const userVerifyDataLogging = async(updatedJSON) => {
    fs.appendFile(`./loggers//${headName}_verify_data.txt`, JSON.stringify(updatedJSON) + ',' , (err) => {
        if(err) console.log('Error writing file:', err);
    })
    console.log('Verified update log with: ', updatedJSON)
}

export const userCheckVerifyDataStatusLogging = async(updatedJSON) => {
    fs.appendFile(`./loggers//${headName}_check_status.txt`, JSON.stringify(updatedJSON) + ',' , (err) => {
        if(err) console.log('Error writing file:', err);
    })
    console.log('Check status log with: ', updatedJSON)
}

