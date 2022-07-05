export default async function handler(request, response) {
    const { method } = request;
  
    if (method === "GET") {
      const { card_id } = request.query; // ต้องเหมือนกับ [ ชื่อไฟล์ ].js
      console.log('Card ID: ', card_id)
      const pure_data = await fetch(`http://localhost:8081/pending_verify_users`);
      const { data }  = await pure_data.json()
      console.log('data => ', data) // Do need to await for json !
      //const check_user = await data.find(value => value.card_id == card_id);
      const check_user = await data.find(value => value.id == card_id);
      console.log('check_user => ', check_user)
      return response.status(200).json(check_user);
    }
}