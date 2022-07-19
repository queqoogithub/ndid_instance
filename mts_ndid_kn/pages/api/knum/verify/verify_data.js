import nc from "next-connect";
import applyRateLimit from '../../../../utils/ApplyRateLimit';
import pairs from "../../../../utils/PairIdentityInfo";
import CryptoJS from 'crypto-js'

const hashing = async (toHash) => {
    const password = process.env.SECRETE_KEY;
    const encrypt = (content, password) => CryptoJS.AES.encrypt(JSON.stringify({ content }), password).toString()
    //const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const encryptedString = encrypt(toHash, password)
    return encryptedString
}

const handler = nc({
    onError: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500).end("Something broke!");
    },
  })
  
handler.use(applyRateLimit, pairs) // use middleware rate-limit

handler.post(async(req, res) => {
    const { body, headers } = req;
    const selected_idp_uuid = body.selected_idp_uuid
    const selected_idp_marketing_name = body.selected_idp_marketing_name
    const user_id = body.identifier
    const as_res = await fetch(`http://localhost:8081/ndid/as/001.cust_info_001`, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` 
            //'Authorization': `Bearer ${process.env.KNUM_TOKEN}` // uat-knum
        }
    });
    const as = await as_res.json();
    const as_match_idp = as.find((a) => a.node_name.marketing_name_en == selected_idp_marketing_name).node_id
    console.log('<------------------->')
    console.log('as_match_idp: ', as_match_idp)
    const verified_res = await fetch( "http://localhost:8081/ndid/verify/data", {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` // ${headers.cookie.slice(12)}
        },
        body: JSON.stringify({
            "namespace": "citizen_id",
            "identifier": user_id,
            "request_message": "12345678",
            "idp_id_list": [
                selected_idp_uuid
            ],
            "min_idp": 1,
            "min_aal": 2.2,
            "min_ial": 2.3,
            "mode": 2,
            "bypass_identity_check": false,
            "request_timeout": 3600,
            "data_request_list": [
                {
                "service_id": "001.cust_info_001",
                "as_id_list": [
                    as_match_idp
                ],
                "min_as": 1,
                "request_params": ""
                }
            ]
        })
    })
    
    const verified = await verified_res.json()
    const currentTs = await parseInt(Date.now() / 1000)
    console.log('start TS = ', currentTs)
    console.log('verified: ', verified)

    const refIdHash = await hashing(verified.reference_id)
    console.log('hash red_id = ', refIdHash)

    return res.status(200).json({...verified, ts: currentTs, pairRefId: refIdHash})

})

export default handler;