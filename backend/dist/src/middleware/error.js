export function error(err, req, res, next) {
    try {
        const msg = JSON.parse(err.message);
        res.status(err.statusCode).json({ msg });
    }
    catch (error) {
        res.status(err.statusCode).json({ message: err.message });
    }
}
