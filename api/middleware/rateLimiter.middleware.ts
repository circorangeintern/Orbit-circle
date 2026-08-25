import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
        status: "failed",
        message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default limiter;
