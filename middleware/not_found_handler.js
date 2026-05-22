export const notFoundErrorHanlder = (req, res) => {
    res.status(404).json({"msg":"Route not found"});
}