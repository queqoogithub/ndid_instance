import nc from "next-connect";
import applyRateLimit from '../../../../../utils/ApplyRateLimit';
import pairsRefId from "../../../../../utils/PairIdentityRef";

const handler = nc({
    onError: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500).end("Something broke!");
    },
  })
  
handler.use(applyRateLimit, pairsRefId) // pairsRefId

handler.get(async (req, res) => {
    const { reference_id } = req.query;
    console.log('query ref-id: ',reference_id )
    const status_res = await fetch(`http://localhost:8081/ndid/verify/status/${reference_id}`, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` // ${headers.cookie.slice(12)}
        },
    });
    const status  = await status_res.json()
    console.log('status_res OK ? ', status_res.status)
    
    // TODO ... respone data to Creden ... by Encrypt(data) or Post(data) and then @Frontend direct to Creden page .
    //console.log('pending status = ', status) 
    if(!status.error) {
        console.log('pending status = ', status)   
        return res.status(200).json(status);
    }
    //return res.status(200).json(status);
  });
  
export default handler;