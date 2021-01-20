const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');
const jwt =  require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');



router.get('/',auth,async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


router.post('/',
[
    //validation
    check('email','include a valid email').isEmail(),
    check('password','enter valid password').exists()

],
async (req, res) => {
    //check for error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructuring     
    const {email,password} = req.body;

    try {
        
  

        //user exist or not 
        let user = await User.findOne({ email});
        if (!user) {
            res.status(400).json({errors:[{msg: 'Invalid  cred'}]});
        }

       
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            res.status(400).json({errors:[{msg: 'Invalid  cred'}]});
        }
        

        // jwt token
        const payload = {
            user:{
                id: user.id,
            }
        };

        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:36000},(err,token)=>{if(err) throw err; res.json({token})});


    } catch (error) {
        console.error(error);
        res.status(500).send('server error');

    }

    

})






module.exports = router;