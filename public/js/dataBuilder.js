const fs = require('fs');
const constants = require('./constants');

function getDataMatrix(dependencies, jsFiles) {
    let dependenciesArr = Object.keys(dependencies);
    let validJsFiles = [];
    let matrix = [];
    let modulesMap = new Map();

    jsFiles.forEach((file) => {
        let rawContent = fs.readFileSync(file,"utf-8");
        let content = rawContent.split("\n");
        let moduleToVariableMap = getModuleToVariableMap(content);
        let freqMap = getFrequencyOfLocalVariable(content, moduleToVariableMap, new Set(dependenciesArr));

        if (Object.keys(freqMap).length > 0) {
            validJsFiles.push(file);
            matrix.push(createFileDataArray(freqMap, dependenciesArr));
            addModulesMap(modulesMap, freqMap, file);
        }
    });

    matrix = fillFileDataArrayBuffer(matrix, validJsFiles.length);
    matrix = matrix.concat(createModulesMatrix(dependenciesArr, validJsFiles, modulesMap));
    validJsFiles = removeRepoPrefix(validJsFiles);

    return {
        packageNames: validJsFiles.concat(dependenciesArr),
        matrix: matrix        
    }
}

// Find dependent node modules in file content.
// Returns a map of the matching node modules.
function getModuleToVariableMap(content) {
    let moduleToVariableMap = new Map();

    content.forEach((line) => {
        // Hacky, but prevents from getting the word
        // require in strings.
        if (line.includes("require(")) {
            let lineSplit = line.split("=");

            if (lineSplit.length > 1) {
                let varName = extractVariableName(lineSplit[0]);
                let requiredMod = extractModuleName(lineSplit[1]);

                moduleToVariableMap[requiredMod] = varName;
            }   
        }
    });

    return moduleToVariableMap;
}

function extractVariableName(str) {
    let varDefArr = str.split(" ");
    let varName = varDefArr.pop();

    while (varName === "") {
        varName = varDefArr.pop();
    }

    // TODO: how to handle when array reaches
    // bottom and an undefined value is returned.

    return varName;
}

function extractModuleName(str) {
    let requireDefArr = str.split("'");

    // Hardcoded, get the second element.
    return requireDefArr[1];
}

function getFrequencyOfLocalVariable(content, mtvMap, dependenciesSet) {
    let freqMap = new Map();

    Object.keys(mtvMap).forEach((key) => {
        if (dependenciesSet.has(key)) {
            let acc = 0;

            content.forEach((line) => {
                acc += line.split(mtvMap[key]).length - 1;
            });

            freqMap[key] = acc;
        }
    });

    return freqMap;
}

function createFileDataArray(freqMap, dependenciesArr) {
    let dArr = [];

    dependenciesArr.forEach((d) => {
        let freq = freqMap[d] || 0;
        dArr.push(freq);
    });

    return dArr;
}

function fillFileDataArrayBuffer(initMatrix, buffer) {
    let bufferedMatrix = [];

    initMatrix.forEach((arr) => {
        let bufferArr = Array(buffer);
        bufferArr.fill(0);

        bufferedMatrix.push(bufferArr.concat(arr));
    });

    return bufferedMatrix;
}

function addModulesMap(modulesMap, freqMap, file) {
    Object.keys(freqMap).forEach(function (key) {

        let files = modulesMap[key];
        if(files == null)
        {
            modulesMap[key] = [];
            modulesMap[key].push(file);
        }
        else{
            modulesMap[key].push(file);
        }
    });
}

function createModulesMatrix(dependenciesArr, validFiles, modulesMap) {
    let modulesMatrix = [];

    dependenciesArr.forEach((d) => {
        let moduleDataArr = [];
        let modulesRefSet = new Set(modulesMap[d]);

        if (modulesRefSet) {
            validFiles.forEach((file) => {
                let existIndicator = (modulesRefSet.has(file)) ? 1 : 0;
                moduleDataArr.push(existIndicator);
            });

            let bufferArr = Array(dependenciesArr.length);
            bufferArr.fill(0);

            modulesMatrix.push(moduleDataArr.concat(bufferArr));
        }
    });

    return modulesMatrix;
}

function removeRepoPrefix(files) {
    let processedArr = [];

    files.forEach((file) => {
        processedArr.push(file.replace(constants.REPO_DIR + "/", ""));
    });

    return processedArr;
}

module.exports = {
    getDataMatrix: getDataMatrix
}
