export default async function handler(request, response) {
    const { method } = request;

    if (method == "POST") {
        const { uuid } = request.query;
        const { body } = request;
        console.log('uuid = ', uuid);
        console.log('from server: ', body);
        return response.status(200).json(body);
        //response.writeHead(302, { Location: '/' }).end()
        // try {
        //     console.log('res.redirect success ! ')
        //     response.redirect(307, '/')
        // } catch (e) {
        //     console.log('error = ', e)
        // }
        
    }
}