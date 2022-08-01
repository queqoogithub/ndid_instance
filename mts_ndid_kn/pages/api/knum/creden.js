import nc from "next-connect";
import applyRateLimit from "../../../utils/ApplyRateLimit";
import CryptoJS from 'crypto-js'
import { userIdpsAndAsLogging, userAmloLogging } from '../../../utils/Logger';
import idps_knum from "../../../utils/idps_knum";

const handler = nc({
    onError: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500).end("Something broke!");
    },
})

handler.use(applyRateLimit);

handler.post(async(req, res)=>{
  // Todo ... from creden 1st input 
  const { body, headers } = req;
  const sym_key = headers.skey;
  const card_id = body.cid;
  const firstname = body.firstname;
  const lastname = body.lastname;
  const apptype = body.apptype;

  if(sym_key !== 'secure secret key') {
    // todo ... res & redirect
    console.log('invalid symatic key !')
    return res.status(400).json({error: 'invalid symatic key'})
  }

  // amlo blacklist process
  const amlo_res = await fetch("http://localhost:8081/amlo/verify", {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` 
      //'Authorization': `Bearer ${process.env.KNUM_TOKEN}` // uat-knum
    },
    body: JSON.stringify({
      "cid": card_id
    })
  })
  console.log('AMLO res do not ok? > ', !amlo_res.ok)
  const amlo = await amlo_res.json()
  // todo ... id donot exist
  console.log('amlo res: ', amlo)
  await userAmloLogging({ts: Date.now(), card_id: card_id, return_flag: amlo})
  if(amlo.error){
    return res.status(401).json({error: 'sticky amlo policy 1'})
  }
  const amloList = amlo.map( c => c.return_flag )
  console.log('amlo list = ', amloList)
  if(amloList.includes('Y')){
    return res.status(401).json({error: 'sticky amlo policy 2'})
  }

  // ndid exist process
  const idps_res = await fetch("http://localhost:8081/ndid/idps", {
  //const res = await fetch(process.env.KNUM_DRUPAL, { // uat-knum
  method: 'post',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` 
        //'Authorization': `Bearer ${process.env.KNUM_TOKEN}` // uat-knum
    },
    body: JSON.stringify({
        "min_aal": 2.2,
        "min_ial": 2.3,
        "namespace": "citizen_id",
        "identifier": card_id,
        "on_the_fly_support": true
    })
  })
  const idps = await idps_res.json();
  await userIdpsAndAsLogging({ts: Date.now(), card_id: card_id, idps})
  if(idps.error) {
    console.log('sticky ndid policy 1: ', idps.error)
    return res.status(402).json({error: 'sticky ndid policy 1'})
  }
  console.log('idps_res: ', idps)
  if(!idps_res.ok && idps == []) {
    console.log('sticky ndid policy 2')
    return res.status(402).json({error: 'sticky ndid policy 2'})
  }
  const user_idps = idps.map((idp) => (idps_knum.icons.find((c) => c.uuid == idp.id))).map((d) => d.name)

  // encryption process
  const info = {
    card_id: card_id,
    firstname: firstname,
    lastname: lastname,
    apptype: apptype,
    user_idps: user_idps
  }
  const password = 'secure secret key'; // TODO ... env
  const encrypt = (content, password) => CryptoJS.AES.encrypt(JSON.stringify({ content }), password).toString()
  const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    
  // Encrypt
  const encryptedObject = encrypt({ info: info }, password)
  console.log('encrypt = ', encryptedObject)
    
  // Decrypt
  const decryptedObject = decrypt(encryptedObject, password)
  console.log('decrypt = ', decryptedObject)
    
  // Encode / Decode URI เรา Encode เพื่อกำจัด "/" 
  const urlEncode = encodeURIComponent(encryptedObject.toString())
  console.log('encrypt uri = ', urlEncode)
  console.log('decrypt uri = ', decodeURIComponent(urlEncode))

  return res.status(200).json({client_url: urlEncode})

});

export default handler;