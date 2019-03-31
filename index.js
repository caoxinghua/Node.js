const express = require('express');
const bodyparser = require('body-parser');
const userRouter = require('./router/userRouter');

require('./db/mongoose');

const app = express();
app.use(bodyparser.json());
app.use(userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Node.js Server Up');
});