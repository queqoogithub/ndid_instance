// post: /ndid/idps
import nc from "next-connect";
import applyRateLimit from '../../../../utils/ApplyRateLimit';

const handler = nc({
    onError: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500).end("Something broke!");
    },
  })

handler.use(applyRateLimit);

handler.post(async()=>{
  // Todo ... from creden 1st input 
  const { identifier } = req.query;
});