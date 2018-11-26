const git = require('nodegit');
const fs = require('fs');
const constants = require('./constants');
const path = require('path');

async function retrieveRepo(url) {
    try {
        var cloneRepo = await git.Clone(url, constants.REPO_DIR);
        if(cloneRepo.isEmpty() == 0)
        {
            var packages = JSON.parse(fs.readFileSync(constants.REPO_DIR+"/"+"package.json"));
            var dependencies = packages["dependencies"];
            var directory = createDir(dependencies);

            //Get all js files from repo
            var extension = ".js";
            var files = fs.readdirSync(constants.REPO_DIR);

            var srcFiles = getMatchingFiles(files,extension, constants.REPO_DIR);

        }
        else {
            throw new Error("Repository is empty");
        }
    }
    catch (error)
    {
        global.console.log(error.message);
        throw error;
    }

}

module.exports = {
    retrieveRepo: retrieveRepo
};

function createDir (dependencies) {

    var dependencyDir = new Object();
    Object.keys(dependencies).forEach(function (key) {
        dependencyDir[key] = new Object();
    })
    return dependencyDir;
}

function getMatchingFiles(files,extension, repoPath)
{
    var targetFiles = [];
       files.filter(function (file) {
        if(fs.lstatSync(repoPath+"/"+file).isDirectory() && !file.includes(".git"))
        {
            var temp = fs.readdirSync(repoPath+"/"+file);
            var found = (getMatchingFiles(temp,extension,repoPath+"/"+file));
            targetFiles = targetFiles.concat(found);
        }
        else {
            if(path.extname(file).toLowerCase() === extension)
            {
                targetFiles.push(repoPath+"/"+file);
            }
        }
    });
    return targetFiles;
}
