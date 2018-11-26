const git = require('nodegit');
const fs = require('fs');
const constants = require('./constants');
const path = require('path');

let dMap = new Map();

async function retrieveRepo(url) {
    let cloneRepo = await git.Clone(url, constants.REPO_DIR);
        
    if (cloneRepo.isEmpty()) {
        throw new Error("Repository is empty.");
    }
}

function getDependencyMap() {
    let packageJson = JSON.parse(fs.readFileSync(constants.PACKAGE_JSON_DIR));
    let dependencies = packageJson[constants.PACKAGE_JSON_DEPENDENCIES];

    Object.keys(dependencies).forEach(key => {
        dMap[key] = new Map();
    });
    return dMap;
}

function getJsFilePaths(dirPath) {
    let jsFilePaths = [];
    let allFiles = fs.readdirSync(dirPath);

    allFiles.forEach(function (file) {
        let filePath = dirPath+ "/" + file;
        let isDir = fs.lstatSync(filePath).isDirectory();
        let noGit = !file.includes(".git");

        if (isDir && noGit) {
            jsFilePaths = jsFilePaths.concat(getJsFilePaths(filePath));
        } else if (path.extname(file).toLowerCase() === constants.TARGET_FILE_EXTENSION) {
            jsFilePaths.push(filePath);
        }
    });

    return jsFilePaths;
}

function findDependencies(jsFiles, dependenciesMap){

    jsFiles.forEach(function (file) {
        let rawContent = fs.readFileSync(file,"utf-8");
        let content = rawContent.split("\n");
        let fileName = file.split("/").pop();
        classModules(content,fileName);

    });
    return content;
}

function classModules(content, file)
{
    content = content.filter(function (value) {
        return (value !== "" && value != null);
    })
    content.forEach(function (line) {
        matchModules(line,file)
    })
}

function matchModules(line,file)
{
    Object.keys(dMap).forEach(key => {
       if(line.includes(key.toString()))
    {
        let count = dMap[key][file];
        if(count == null)
        {
            dMap[key][file] = 1;
        }
        else{
            dMap[key][file] = count++;
        }
    }
    });
}

module.exports = {
    retrieveRepo: retrieveRepo,
    getDependencyMap: getDependencyMap,
    // getJsFiles sounds more like a helper for analysis, put here for test
    // but get rid of it for export later
    getJsFilePaths: getJsFilePaths,
    findDependencies:findDependencies
};
