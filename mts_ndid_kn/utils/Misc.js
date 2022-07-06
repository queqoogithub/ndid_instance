// export default function haloo(req, res) {
//     console.log('halooooo ........................')
//     res.status(200).json({ name: 'Halooo i am mid' })
// }

const checkIp = async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress
    console.log('Caller ip: ', ip)
    //next();
    return ip
}

export { checkIp }