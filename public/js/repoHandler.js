const git = require('nodegit');
const constants = require('./constants');

async function retrieveRepo(url) {
    await git.Clone(url, constants.REPO_DIR);
}

module.exports = {
    retrieveRepo: retrieveRepo
}