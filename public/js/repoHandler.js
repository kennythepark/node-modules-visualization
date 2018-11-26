const git = require('nodegit');
const fs = require('fs');
const constants = require('./constants');
const path = require('path');

async function retrieveRepo(url) {
    let cloneRepo = await git.Clone(url, constants.REPO_DIR);
        
    if (cloneRepo.isEmpty()) {
        throw new Error("Repository is empty.");
    }
}

function getDependencyMap() {
    let dMap = new Map();
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

function deleteDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file, index) => {
            let curPath = dirPath + "/" + file;
            
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteDirectory(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(dirPath);
    }
}

module.exports = {
    retrieveRepo: retrieveRepo,
    getDependencyMap: getDependencyMap,
    getJsFilePaths: getJsFilePaths,
    deleteDirectory: deleteDirectory
};
