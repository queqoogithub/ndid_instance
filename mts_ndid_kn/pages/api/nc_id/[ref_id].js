import nc from "next-connect";
import applyRateLimit from '../../../utils/ApplyRateLimit';

// export default async function handler(request, response) {
//     const { method } = request;
  
//     if (method === "GET") {
//       const { ref_id } = request.query; // ต้องเหมือนกับ [ ชื่อไฟล์ ].js
//       //console.log('Card ID: ', ref_id)
//       const pure_data = await fetch(`http://localhost:8081/pending_verify_users`);
//       const { data }  = await pure_data.json()
//       //console.log('data => ', data) // Do need to await for json !
//       //const check_user = await data.find(value => value.card_id == ref_id);
//       const check_user = await data.find(value => value.id == ref_id);
//       //console.log('check_user => ', check_user)
//       return response.status(200).json(check_user);
//     }
// }

const handler = nc({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
})

handler.use(applyRateLimit) // use middleware rate-limit

handler.get(async (req, res) => {
  const { ref_id } = req.query; // ต้องเหมือนกับ [ ชื่อไฟล์ ].js
  const pure_data = await fetch(`http://localhost:8081/pending_verify_users`);
  const { data }  = await pure_data.json()
  const check_user = await data.find(value => value.id == ref_id);
  
  return res.status(200).json(check_user);
});

export default handler;
