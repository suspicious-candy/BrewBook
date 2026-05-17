import ratelimit from "../config/upstash.js"
/**
 * Express middleware that enforces a sliding-window rate limit backed by Upstash Redis.
 * Each unique IP address is allowed 5 requests per 100-second window (configured in
 * config/upstash.js). Exceeding the limit returns 429 Too Many Requests.
 * If the Upstash call itself fails, the error is forwarded to Express error handler
 * rather than blocking the request, so a Redis outage does not take down the API.
 */
const rateLimiter = async (req, res, next) => {
    try{
        const {success} = await ratelimit.limit(req.ip ?? "anonymous");

        if(!success){
            return res.status(429).json({
                message : "Too many requests",
            })
        }

        next();
    }
    catch(error){
        console.log("Rate Limit error",error);

        next(error);
    }
}

export default rateLimiter;