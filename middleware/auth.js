const jwt = require('jsonwebtoken');
const User = require('../db/user');
const keys = require('../keys');

const auth = async function(req, res, next){
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, keys.SECRETKEY);
        const user = await User.findOne({_id: decode._id, 'tokens.token': token});//quotes with object key: reserved keywords or not a valid JavaScript identifier
        if(!user){
            throw new Error({error: 'user is not found with token'});
        }
        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({error: 'token is not valid'});
    }
}

module.exports = auth;