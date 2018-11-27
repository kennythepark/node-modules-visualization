const fs = require('fs');

let modulesMap = new Map();
function getDataMatrix(dependencies, jsFiles) {
    let matrix = [];

    console.log(jsFiles);

    jsFiles.forEach((file) = > {
        let rawContent = fs.readFileSync(file, "utf-8");
    let content = rawContent.split("\n");
    let moduleToVariableMap = getModuleToVariableMap(content);
    let freqMap = getFrequencyOfLocalVariable(content, moduleToVariableMap);

    //matrix.push(createFileDataArray(freqMap, dependencies, jsFiles.length));
    addModulesMap(freqMap, file);
    });
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

function getFrequencyOfLocalVariable(content, mtvMap) {
    let freqMap = new Map();

    Object.keys(mtvMap).forEach((key) => {
        let acc = 0;

        content.forEach((line) => {
            acc += line.split(mtvMap[key]).length - 1;
        });

        freqMap[key] = acc;
    });

    return freqMap;
}

function createFileDataArray(freqMap, dependencies, numOfFiles) {
    let dArr = Array(numOfFiles);
    dArr.fill(0);

    console.log(dArr);
    
    dArr.push(1);

    console.log(dArr);

    return [];
}

function findDependencies(jsFiles, dependenciesMap){
    jsFiles.forEach(function (file) {
        let rawContent = fs.readFileSync(file,"utf-8");
        let content = rawContent.split("\n");
        let fileName = file.split("/").pop();

        Object.keys(dMap).forEach(key => {
            variableMap[key] = [];
    });

        classModules(content,fileName);
    });
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
       if(line.includes(key.toString()) || checkVariables(line,key))
    {
        if(line.includes("require"))
        {
            variableMap[key].push(line.split(" ")[1]);
        }
        let count = dMap[key][file];
        if(count == null)
        {
            dMap[key][file] = 1;
        }
        else{
            dMap[key][file] = count + 1;
        }
    }
    });
}

function checkVariables(line,key) {

    let found = false;
    variableMap[key].forEach( function (variable) {
        if(line.includes(variable)) found = true;
    });
    return found;
}

function addModulesMap(freqMap, file)
{
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

module.exports = {
    getDataMatrix: getDataMatrix
}
