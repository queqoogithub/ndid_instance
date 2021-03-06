import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

const applyMiddleware = middleware => (request, response) =>
  new Promise((resolve, reject) => {
    middleware(request, response, result =>
      result instanceof Error ? reject(result) : resolve(result)
    )
  })

const getIP = request =>
  request.ip ||
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.connection.remoteAddress

export const getRateLimitMiddlewares = ({
  limit = 10, // limit each IP to 10 requests per windowMs
  windowMs = 3 * 1000, // 3 seconds
  delayAfter = Math.round(10 / 2),
  delayMs = 500,
} = {}) => [
  slowDown({ keyGenerator: getIP, windowMs, delayAfter, delayMs }),
  rateLimit({ keyGenerator: getIP, windowMs, max: limit, }),
]

const middlewares = getRateLimitMiddlewares()

async function applyRateLimit(request, response, next) {
  //console.log('apply rate-limit middleware')
  await Promise.all(
    middlewares
      .map(applyMiddleware)
      .map(middleware => middleware(request, response))
  )
  next();
}

export default applyRateLimit