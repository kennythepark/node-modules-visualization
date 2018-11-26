let variableMap = new Map();

function getDataMatrix(dMap, jsFiles) {

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

module.exports = {
    getDataMatrix: getDataMatrix
}
