export const errorHandler = (error, req, res, next) => {
    if (error.status) {
        res.status(err.status).json({"msg": error.message});
    } else {
        res.status(404).json({"msg": error.message});
    }
}