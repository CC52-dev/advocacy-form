export function request(req, res, next) {
    const time = new Date().toISOString();
    console.log("Request", req.url, req.ip, time);
    next();
}
