import CryptoJS from 'crypto-js'

const pairs = async(req, res, next) => {
    const { body, headers } = req;
    const user_id = body.identifier;
    const pair_info = headers['pair-identity-info'] // hash token
    
    // decrypt -> pair_info
    const password = process.env.SECRETE_KEY // TODO ... env
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedObject = decrypt(pair_info, password)
    const pair_id = decryptedObject.info['card_id']

    console.log('middleware for pair identify info, by pair_id = ', pair_id)

    if(user_id != pair_id) {
        console.log('warning log: user_id != pair_id')
        return res.status(401).send();
    }
    next();
}

export default pairs;