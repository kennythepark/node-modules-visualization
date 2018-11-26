const express = require('express')
const bodyParser = require('body-parser');
const repoHandler = require('./public/js/repoHandler');
const constants = require('./public/js/constants');
const app = express()

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/', (req, res) => {
  repoHandler.retrieveRepo(req.body.url)
  .catch(err => {
    global.console.log(err);
    next(err);
  }); 

  res.render('index');
})

app.listen(3000, () => {
  console.log('NODEpendency app listening on port 3000!')
})
