
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const connectionURL = 'mongodb+srv://max:6rrpKWNtJ2sVPlDX@cluster0-rbzmd.mongodb.net/test?retryWrites=true';
const databaseName = 'task-manager';

MongoClient.connect(connectionURL, { useNewUrlParser: true}, (err, client) => {
    if(err){
        return console.log('Unable to connect');
    }

    const db = client.db(databaseName);
    //insert
    db.collection('users').insertOne({
        _id: new ObjectID(),
        name: 'Luca',
        age: 2
    }, (err, res) => {
        if(err){
            return console.log('Failed to insert: ' + err);
        }

        console.log(res.ops);
    });
    db.collection('users').insertMany([{
        name: 'Griffin',
        age: 3
    }, {
        name: 'Melody',
        age: 36
    }], (err, res) => {
        if(err){
            return console.log('Failed to insert: ' + err);
        }

        console.log(res.ops);
    });

    //Find
    db.collection('users').findOne({name: 'Melody'}, (err, user) => {
        if(err){
            console.log('Unable to find');
        }

        console.log(user);
    });

    db.collection('users').find({age: 36}).toArray((err, users) => {
        console.log(users);
    });

    //Update
    db.collection('users').updateOne({
        _id: new ObjectID('5c9e95a641f84221c82c154b')
    }, {
        $set: {
            name: 'Max'
        },
        $inc: {
            age: 1
        }
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });

    //Delete
    db.collection('users').deleteMany({
        _id: new ObjectID('5c9e95a641f84221c82c154b')
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });
});