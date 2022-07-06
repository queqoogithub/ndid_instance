// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Explore rate-limit for api by usage middleware 
import { checkIp } from '../../utils/Misc';
//import applyRateLimit from '../../utils/ApplyRateLimit';
import nc from "next-connect";

import rateLimit from 'express-rate-limit'

const allowlist = ['::1', '192.168.137.1', '192.100.65.33']

// for lab
const limiter = rateLimit({
	windowMs: 10 * 1000, // 10 seconds (after that will reset time and being request agian)
	max: 5, // Limit each IP to 5 requests per `window` (here, per 10 seconds)
  message: 'Too many accounts created from this IP, please try again after an hour !',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  //skip: (req, res) => allowlist.includes(req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress),
})

const handler = nc({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
})

handler.use(limiter) // use middleware rate-limit

handler.get(async (req, res) => {
  console.log('after mid')
  res.status(200).send('John Doe !!!')
});

// const handler = nc({
//   onError: (err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).end("Something broke!");
//   },
//   onNoMatch: (req, res) => {
//     res.status(404).end("Page is not found");
//   },
// })
//   .use(haloo)
//   .get((req, res) => {
//     console.log('after mid !!!!!!!!')
//     res.send("Hello world");
//   })
//   .post((req, res) => {
//     res.json({ hello: "world" });
//   })
//   .put(async (req, res) => {
//     res.end("async/await is also supported!");
//   })
//   .patch(async (req, res) => {
//     throw new Error("Throws me around! Error can be caught and handled.");
//   });

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }
export default handler;