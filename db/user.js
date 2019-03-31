const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../keys');

Schema = mongoose.Schema;

var UserSchema = new Schema ({
    name: {
        type: String,
        required: [true, "Must input a task name"]
    },
    age: {
        type: Number,
        require: true,
        default: 0
    },
    phone: {
        type: String,
        validate: {
          validator: function(v) {
            return /\d{3}-\d{3}-\d{4}/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
      },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not Valid Email")
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    profile: {
        type: Buffer
    }
}, {
    timestamps: true//two more columns: createdAt, updatedAt 
});
//---------User--Task--Relationship--------------
/*
for Task Schema with user id
owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'//model name
    }
1. the in the code create new task:
new Task({...req.body, owner: req.user._id})
2. get the user info by task id:
await task.populate('owner').execPopulate();
*/

/*
UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',// prop name of User of the relationship
    foreignField: 'owner' //Prop name of Task
})


//-------------------Filter-----------------------
//query filter to display
//if url is localhost:3000/tasks?completed=false
const match = {};
if(req.query.completed){
    match.completed = req.query.completed === 'true'? true: false;
}
//------------------Pagenation---------------------
//if url is localhost:3000/tasks?limit=10&skip=5   ----> 10 items per page and skip first 5
//------------------Sorting-------------------------
//if url is localhost:3000/tasks?sortBy=createdAt: desc  -----> asc is 1, desc is -1
await user.populate({path: 'tasks', match, options: {limit: parseInt(req.query.limit), skip: parseInt(req.query.skip), sort: {createdAt: -1}}).execPopulate();
console.log(user.tasks)
*/

UserSchema.statics.checkCredentials = async function (userPassword, reqPassword) {
    const isMatch = await bcrypt.compare(reqPassword, userPassword);
    if(!isMatch){
        throw new Errow('Password is wrong');
    }
}

UserSchema.methods.generateAuthTokenAndSave = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, keys.SECRETKEY, { expiresIn: '24 hours'});
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

//UserSchema.statics.function are the methods defined on the Model. UserSchema.methods.function are defined on the document (instance).
//the only usage difference is whether you use the Model or the document to call the method
/*
User.staticsFunction(..., function(err, user){
    user.methodsFunction(function(err, res){
    })
});
*/

UserSchema.pre('save', async function(next){
    const user = this; //can't use arrow function
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);//8 means hash 8 times
    }
    next();
});

//Remove user will delete tasks of that user
/*
UserSchema.pre('remove', async function(next){
    const user = this;
    Task.deleteMany({owner: user._id});
    next();
});
*/

//overwrite toJSON will be auto called by res.send(user) which will call JSON.stringify()
//toObject has the same logic
UserSchema.methods.toJSON = function(){
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.profile;
    return userObj;
}

const User = mongoose.model('users', UserSchema);

module.exports = User;