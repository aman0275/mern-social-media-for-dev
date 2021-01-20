const jwt = require('jsonwebtoken');
const config = require('config');

module.exports= function (req, res, next) {
    // Get token from header
    const token = req.headers['x-auth-token'];
    // Check if bearer is undefined
    if(!token) {
     return res.status(401).json({msg: 'No token bro, auth denied'});
    }
    
    //https://www.youtube.com/watch?v=7nafaH9SddU
    //to learn about token
    
    //verify token

    try {
        //user is saved here
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user = decoded.user;
        next();

    } catch (err) {
        res.status(401).json({msg: 'Token not valid'});
    }



}