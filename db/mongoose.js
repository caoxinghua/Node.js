
const mongoose = require('mongoose');

const connectionURL = 'mongodb+srv://max:6rrpKWNtJ2sVPlDX@cluster0-rbzmd.mongodb.net/test?retryWrites=true';
const databaseName = 'Nodejs';
mongoose.connect(connectionURL + '/' + databaseName, { useNewUrlParser: true,  useCreateIndex: true});