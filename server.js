const express = require('express')
const bodyParser = require('body-parser');
const repoHandler = require('./public/js/repoHandler');
const dataBuilder = require('./public/js/dataBuilder');
const constants = require('./public/js/constants');
const app = express()

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index', { dependencyData: null });
})

app.post('/', (req, res) => {
  repoHandler.retrieveRepo(req.body.url)
  .then(() => {
    let dependencyMap = repoHandler.getDependencyMap();
    let targetFiles = repoHandler.getJsFilePaths(constants.REPO_DIR)
    // repoHandler.findDependencies(targetFiles, dependencyMap);
  
    // THIS IS ONLY TEST DATA, DELETE AFTERWARDS
    let testData = {
      packageNames: ['Main', 'A', 'B', 'C', 'D', 'E', 'DFDFD'],
      matrix: [[0, 1, 1, 1, 1, 1, 0], 
      [0, 0, 1, 1, 0, 1, 0], 
      [0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0, 1, 0]] 
    };
  
    res.render('index', { dependencyData: JSON.stringify(testData)});

    // Delete the visualized repo afterwards.
    repoHandler.deleteDirectory(constants.REPO_DIR);
  })
  .catch(err => {
    global.console.log(err);
    res.render('index', { dependencyData: null});
  }); 
})

app.listen(3000, () => {
  console.log('NODEpendency app listening on port 3000!')
})
