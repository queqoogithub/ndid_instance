// external APIs: Knum
import { sample_user_with_idp } from "../../../data";

export default async function handler(request, response) {
    const { method } = request;
  
    if (method === "GET") {
      const pure_data = await fetch(`http://localhost:8081/posts`);
      const data = await pure_data.json()
      console.log('data => ', data['data']) // Do need to await for json !
      return response.status(200).json(data['data']);
    }
  
    // if (method === "POST") {
    //   const { body } = request;
    //   sample_user_with_idp.push({ ...body, id: sample_user_with_idp.length + 1 });
    //   return response.status(200).json(sample_user_with_idp);
    // }

    if (method === "POST") {
        const { body, headers } = request;
        console.log('header auth token pure from cookie: ', headers.cookie.slice(12))
        fetch( "http://localhost:8081/verify", {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${headers.cookie.slice(12)}`
        },
        body: JSON.stringify( {

            "card_id": body.card_id,
            "name": body.name,
            "selected_bank": body.content

        } )
        } ).then( res => res.json() )
           .then( res => console.log( res ) );
        return response.status(200).json(body);
    }
  }