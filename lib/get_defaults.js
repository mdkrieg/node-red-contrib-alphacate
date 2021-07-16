
const alphacate = require('alphacate');
const fs = require('fs');

//let rawdata = fs.readFileSync('OBV-data.json');
//let data = JSON.parse(rawdata);

var allFunctions = [];//{};
var uniqueOptions = [];

for (var fn in alphacate){
    if (alphacate[fn].name != fn){
        // package has doubled up each function with valid calls
        // for both long and short name, grab the short names only
        var temp_fn = new alphacate[fn];
        var options = temp_fn._options;
        // REMOVE the following parameters
        delete options.lazyEvaluation;
        delete options.sliceOffset;
        delete options.startIndex;
        delete options.endIndex;
        delete options.maxTickDuration;
        //allFunctions[alphacate[fn].name]={name: fn, options: temp_fn._options};
        allFunctions.push({fn: alphacate[fn].name, name: fn, options: temp_fn._options});
        for (var op in temp_fn._options){
          if(!uniqueOptions.includes(op)) uniqueOptions.push(op);
        }
    }
}

console.log(uniqueOptions);

var output = JSON.stringify(allFunctions);

fs.writeFile('defaults.json', output, err => {
  if (err) {
    console.error(err);
    return;
  }
  //file written successfully
})