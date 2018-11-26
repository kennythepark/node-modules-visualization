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
    let packageJson = JSON.parse(fs.readFileSync(constants.PACKAGE_JSON_DIR));
    let dependencies = packageJson[constants.PACKAGE_JSON_DEPENDENCIES];
    let dMap = new Map();

    Object.keys(dependencies).forEach(key => {
        dMap[key] = new Map();
    });

    return dMap;
}

function getJsFilePaths(dirPath) {
    let jsFilePaths = [];
    let allFiles = fs.readdirSync(dirPath);

    allFiles.forEach(file => {
        let filePath = constants.REPO_DIR + "/" + file;
        let isDir = fs.lstatSync(filePath).isDirectory();
        let noGit = !file.includes(".git");

        if (isDir && noGit) {
            jsFilePaths = jsFilePaths.concat(getJsFilePaths(filePath));
        } else if (path.extname(file).toLowerCase === constants.TARGET_FILE_EXTENSION) {
            jsFilePaths.push(filePath);
        }
    });

    return jsFiles;
}

module.exports = {
    retrieveRepo: retrieveRepo,
    getDependencyMap: getDependencyMap,
    // getJsFiles sounds more like a helper for analysis, put here for test
    // but get rid of it for export later
    getJsFilePaths: getJsFilePaths
};
