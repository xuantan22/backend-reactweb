const jwt = require('jsonwebtoken')
module.exports.fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using valid" })
    } else {
        try {
            const data = jwt.verify(token, 'secret_token');
            req.user = data.user
            next();
        } catch (error) {
            res.status(401).send({ error: "please authenticate" })
        }
    }
}