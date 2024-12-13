const jwt = require('jsonwebtoken');


async function verifyToken(jwt, token, key){
    return new Promise((resolve, reject) =>{
        jwt.verify(token, key, (err, decoded) =>{
            if(err){
                reject({});
            }else{
                resolve(decoded);
            }
        })
    })
}


module.exports = async (req, res, next) =>{
    const authHeader = req.get('Authorization');
    const error = new Error('Unauthenticated');
    error.statusCode = 401;
    if(!authHeader){
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    await verifyToken(jwt, token, 'mysecret').catch(err => next(error));
    next();
}