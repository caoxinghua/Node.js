
const mongoose = require('mongoose');
const validator = require('validator');

const connectionURL = 'mongodb+srv://max:6rrpKWNtJ2sVPlDX@cluster0-rbzmd.mongodb.net/test?retryWrites=true';
const databaseName = 'task-manager';
mongoose.connect(connectionURL + '/' + databaseName, { useNewUrlParser: true,  useCreateIndex: true});

const Task = mongoose.model('tasks',  {
    name: {
        type: String,
        required: [true, "Must input a task name"]
    },
    completed: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
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
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not Valid Email")
            }
        }
    }
});

const myTask = new Task({
    name: 'cook',
    count: 2,
    phone: '320-320-3200',
    email: '123@example.com'
});

myTask.save().then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
})