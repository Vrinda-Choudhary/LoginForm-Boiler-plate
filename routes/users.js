const express=require('express');
const router=express.Router();
const bcrypt= require('bcryptjs');
const User = require('../models/User');
const passport=require('passport');

router.get('/login',(req,res)=>res.render('login'));
router.get('/register',(req,res)=>res.render('register'));


//Register handle
router.post('/register', (req,res)=>{
    const { name, email, password, password2 } = req.body;

    let errors = [];


    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg : "Please fill in all the fields!"});
    }

    //Check passwords match
    if(password !== password2){
        errors.push({msg: "Passwords do not match"});
    }


    //Check password length
    if(password.length < 6){
        errors.push({msg: "Password should be atleast 6 characters long"});
    }


    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        //Validation passed
        User.findOne({ email: email })
        .then(user => {
            if(user){
                //user exists
                errors.push({msg: " User with this Email is already registered"})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }
            else{
                const newUser = new User({
                    name,
                    email,
                    password,
                });
                //Hash the password
                bcrypt.genSalt(10, (err,salt)=> bcrypt.hash(newUser.password, salt,(err,hash)=>{
                    if(err) throw err;
                    //set password to hash
                    newUser.password=hash;

                    //save user
                    newUser.save()
                    .then(user =>{
                        req.flash('success_msg','You are now registered and can log in !');
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
                }))
            }
        })
        .catch();

    }
});

//login handle
router.post('/login', (req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req,res,next);
});

router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('success_msg','You have logged out!');
    res.redirect('/users/login');
})


module.exports=router;