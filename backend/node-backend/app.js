const express = require ('express');
const app = express();
const dogsRouter = require('./routes/dogs');
const uploadRouter = require('./routes/upload');

app.use(express.json());
app.use('/dogs', dogsRouter);
app.use('/upload', uploadRouter);

app.get ('/', (req, res) => {
    res.send ('PAWPATH!!!');
});

app.listen (3000, () => console.log('PAWPATH backend listening on port 3000!'));