import CryptoJS from 'crypto-js'

const pairsRefId = async(req, res, next) => {
    const { headers } = req;
    const { reference_id } = req.query;
    const pair_ref_id_hash = headers['pair-identity-ref']

    console.log(' from mid pair ref id: ', reference_id)
    console.log(' from mid pair ref id hash: ', pair_ref_id_hash)


    // decrypt -> pair_ref_id
    const password = process.env.SECRETE_KEY 
    try {
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedString = decrypt(pair_ref_id_hash, password)
    const pair_ref_id = decryptedString

    console.log('middleware for pair_ref_id = ', pair_ref_id)

    if(reference_id != pair_ref_id) {
        console.log('warning log: reference_id != pair_ref_id')
        return res.status(401).send();
    }
    } catch (e) { console.log('unexpect json input (in parser)') }

    next()
}

export default pairsRefId;