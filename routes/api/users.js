const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');
const config = require('config');


const User = require('../../models/User');



router.post('/',
[
    //validation
    check('name','name is required').not().isEmpty(),
    check('email','include a valid email').isEmail(),
    check('password','enter 6 or more characters').isLength({min:6})

],
async (req, res) => {
    //check for error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructuring     
    const {name,email,password} = req.body;

    try {
        
  

        //user exist or not 
        let user = await User.findOne({ email});
        if (user) {
            res.status(400).json({errors:[{msg: 'User already exists'}]});
        }

        // gravatar exist
        const avatar =gravatar.url(email,{
            s:'200',
            r:'g',
            d:'mm',
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // encrypt password

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);
        await user.save();

        
        

        // jwt token
        const payload = {
            user:{
                id: user.id,
            }
        };

        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:3600},(err,token)=>{if(err) throw err; res.json({token})});


    } catch (error) {
        console.error(error);
        res.status(500).send('server error');

    }

    

})





module.exports = router;