const express = require('express');
const multer = require('multer');
const User = require('../db/user');
const auth = require('../middleware/auth');
const router = new express.Router();

//----------Upload-----------------------
const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('Please upload a MS-Word file'));
        }
        cb(undefined, true);
    }
});
//myUpload is the key of Http request.body, form-data key 
// multer will send error by html file. So. use callback function to handle error
router.post('/users/upload', auth, upload.single('myUpload'), async (req, res) => {
    req.user.profile = req.file.buffer;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send(err);
});

router.get('/users/me/profile', auth, async (req, res) => {
    try {
        if(!req.user|| !req.user.profile){
            throw new Error('Please Login');
        }
        res.set('Content-Type', 'application/msword');
        res.send(req.user.profile);
    } catch (err) {
        res.status(404).send();
    }
})
//----------Log In/Out-------------------
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user){
            throw new Error('User is not found');
        }

        await User.checkCredentials(user.password, req.body.password);
        const token = await user.generateAuthTokenAndSave();
        res.status(200).send({user, token});
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( item => item.token !== req.token );
        await req.user.save();
        res.status(200).send();
    } catch (err) {
        res.status(400).send(err);
    }
})

//----------DB CRUD------------------
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send();
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        const token = await user.generateAuthTokenAndSave();
        res.status(201).send({user, token});
    } catch (err) {
        res.status(400).send(err);
    }
})

router.patch('/users/:id', auth, async(req, res) => {
    const allowedUpdates = ['name', 'age', 'phone', 'email', 'password'];
    const updates = Object.keys(req.body); //properties into array
    const isValid = updates.every((prop) => allowedUpdates.includes(prop));

    if(!isValid){
        return res.status(400).send({err: 'Invalid update property'});
    }
    try {
        const user = await User.findById(req.param.id);
        //Not use findbyIdAndUpdate, This way will let save run the middleware.
        updates.forEach( prop => user[prop] = req.body[prop]);
        await user.save();
        if(!user){
            return res.status(404).send({err: 'user is not found'});
        }
        res.send(user);
    } catch (err) {
        res.status(400).send();
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)

        if (!user) {
            return res.status(404).send()
        }
        await user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

module.exports = router