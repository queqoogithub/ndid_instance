// external APIs: Knum
import nc from "next-connect";
import applyRateLimit from '../../../utils/ApplyRateLimit';

// export default async function handler_(request, response) {
//     const { method } = request;
  
//     if (method === "GET") {
//       const pure_data = await fetch(`http://localhost:8081/posts`);
//       const data = await pure_data.json()
//       console.log('data => ', data['data']) // Do need to await for json !
//       return response.status(200).json(data['data']);
//     }

//     if (method === "POST") {
//         const { body, headers } = request;
//         console.log('header identify user: ', headers['authorization-test-creden'])
//         //console.log('header auth token pure from cookie: ', headers.cookie.slice(12))
//         const pure_data = await fetch( "http://localhost:8081/verify", {
//             method: 'post',
//             headers: {
//                 'Accept': 'application/json, text/plain, */*',
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${headers['authorization-test-creden']}` // ${headers.cookie.slice(12)}
//             },
//             body: JSON.stringify({

//                 "card_id": body.card_id,
//                 "name": body.name,
//                 "selected_bank": body.content

//             })
//         })

//         const data = await pure_data.json()
//         console.log("to verify user => ", data)
        
//         // Todo ... loop check (every 30 sec) for pending verification
//         //setTimeout(() => {return response.status(200).json( data )}, headers['pending-verification-time']); // To solve: ติด API resolved without sending a response for /api/nc_id, this may result in stalled requests.
//         return response.status(200).json( data )
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
    const pure_data = await fetch(`http://localhost:8081/posts`);
    const data = await pure_data.json()
    return res.status(200).json(data['data']);
})

handler.post(async (req, res) => {
    const { body, headers } = req;
        console.log('header identify user: ', headers['authorization-test-creden'])
        //console.log('header auth token pure from cookie: ', headers.cookie.slice(12))
        const pure_data = await fetch( "http://localhost:8081/verify", {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${headers['authorization-test-creden']}` // ${headers.cookie.slice(12)}
            },
            body: JSON.stringify({
                "card_id": body.card_id,
                "name": body.name,
                "selected_bank": body.content
            })
        })

    const data = await pure_data.json()
    
    console.log("to verify user => ", data)
    return res.status(200).json( data )
})

export default handler;