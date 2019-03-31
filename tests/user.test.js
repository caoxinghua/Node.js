const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../db/user');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    age:"36",
    name:"Max",
    phone:"320-320-3200",
    email:"123@example.com",
    password:"123456",
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.SECRETKEY)
    }]
}

const userTwo = {
    age:"36",
    name:"Meldoy",
    phone:"320-320-3200",
    email:"456@example.com",
    password:"123456"
}

beforeEach(async () => {
    await User.deleteMany({});
    await new User(userOne).save();
})

test('Sign up a new user', async () => {
    const res = await request(app)
            .post('/users')
            .send(userTwo)
            .expect(201);

    const user = await User.findById(res.body.user._id);
    expect(user).not.toBeNull();
})

test('Login existing user', async () => {
    await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: userOne.password
            })
            .expect(200)
})

test('Login Wrong Info', async () => {
    await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: '789'
            })
            .expect(400)
})

test('Get user Info', async () => {
    await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
})

test('Get Unauthorized', async () => {
    await request(app)
            .get('/users/me')
            .send()
            .expect(401)
})

test('Delete account', async () => {
    await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
})

test('Delete Unauthorized', async () => {
    await request(app)
            .delete('/users/me')
            .send()
            .expect(401)
})

test('Upload Profile', async () => {
    await request(app)
            .post('/users/upload')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('myUpload', 'tests/files/CoverLetter.docx')
            .expect(200);
    const user = await User.findById(userOneId);
    expect(user.profile).toEqual(expect.any(Buffer));
})