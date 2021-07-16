
const alphacate = require('alphacate');

module.exports = function(RED) {
    
    var allFunctions = [];
    
    for (var fn in alphacate){
        if (alphacate[fn].name == fn){
            // package has doubled up each function with valid calls
            // for both long and short name, grab the short names only
            allFunctions.push(fn);
        }
    }
    
    function removeExtraOptions(options){
        var temp_opt = options;
        delete temp_opt.lazyEvaluation;
        delete temp_opt.sliceOffset;
        delete temp_opt.startIndex;
        delete temp_opt.endIndex;
        delete temp_opt.maxTickDuration;
        return temp_opt;
    }
    
    function mergeMACD(data){
        let macdResult = [];
        for(var i in data[0].prices){ //strange but it puts the data in a 1-element array
            macdResult.push({
                slow_ema:   data[0].slow_ema[i],
                fast_ema:   data[0].fast_ema[i],
                signal_ema: data[0].signal_ema[i],
                macd:       data[0].macd[i],
                price:      data[0].prices[i]
            });
        }
        return macdResult;
    }

    function alphacateNode(config) { 
        RED.nodes.createNode(this,config);
        var node = this;
        
        node.on('input', function(msg) {
            config.mergeData = true; //forcing this as it doesn't work with object type
            // and it doesn't seem that useful to have non-merged data anyway
            if(Array.isArray(msg.payload)){
                // Parse as simple array of bars
                analyzeData(node, config, msg, msg.payload);
            }else if (typeof msg.payload === 'object' && msg.payload !== null){
                // Parse as object of {"Symbol": [bars]}
                if (!!msg.completedSymbols){
                    node.warn("Using protected msg property 'msg.completedSymbols', this is overwritten when parsing an object of symbol:[bars]",msg);
                }
                msg.completedSymbols = {};
                /*if (!config.mergeData){
                    //this doesn't work with object type, giving up on for now.
                    if(!!msg.data){
                        node.warn("Using protected msg property 'msg.data', this is overwritten when not using the Merge Data option",msg);
                    }
                    msg.data = {};
                }*/
                for (var key in msg.payload){
                    if(Array.isArray(msg.payload[key])){
                        msg.completedSymbols[key] = false;
                    }
                }// would call from above loop but want to avoid race condition
                for (key in msg.completedSymbols){
                    analyzeData(node, config, msg, msg.payload[key], key);
                }
            }else{
                node.error("Unsupported input type",msg);
            }
        });
    }
    
    function analyzeData(node, config, msg, bar_data, obj_key = false){
    
        node.status({text:"calculating...",fill:"blue"});
        let input_data = [];
        let special_data = {
            ATR: [],
            MFI: [],
            OBV: []
        };
        for (var dp in bar_data){
            input_data.push(bar_data[dp][config.useData]);
            // specify here to handle indicators----
            // with non-default input requirements--
            special_data.ATR.push({
                high:  bar_data[dp].highPrice,
                low:   bar_data[dp].lowPrice,
                close: bar_data[dp].closePrice
            });
            special_data.MFI.push({
                high:  bar_data[dp].highPrice,
                low:   bar_data[dp].lowPrice,
                close: bar_data[dp].closePrice,
                volume:bar_data[dp].volume
            });
            special_data.OBV.push({
                price: bar_data[dp][config.useData],
                volume:bar_data[dp].volume
            });
        }
        if (!config.mergeData){
            if(!!obj_key){
                msg.data[obj_key] = JSON.parse(JSON.stringify(bar_data));
            }else{
                msg.data = JSON.parse(JSON.stringify(bar_data));
            }
            bar_data = [];
        }
        msg.options = {};
        // call all the enabled indicators
        let completedFunctions = {}; // used as "done" test
        // define calculation handler
        let resolveComplete = function(fx, err = false){
            completedFunctions[fx] = true;
            for(var f in completedFunctions){
                if(!completedFunctions[f]) return;
            }
            if(!!obj_key){
                // ^ test if parsing object of symbols and check if complete
                msg.completedSymbols[obj_key] = true;
                for(var s in msg.completedSymbols){
                    if(!msg.completedSymbols[s]) return;
                }
                delete msg.completedSymbols;
            }
            node.send(msg);
            node.status(err?{text:"ERROR",fill:"red"}:{});
        };
        let analyze = async (fx, data, opt) => {
            try{
                let call_fx = new alphacate[fx](opt);
                call_fx.setValues(data);
                let result = await call_fx.calculate();
                if (fx == "MACD") result = mergeMACD(result); 
                if (config.mergeData){
                    for (var j in bar_data){
                        delete result[j].price;
                        let keys = Object.keys(result[j]);
                        if (keys.length == 1){
                            result[j] = result[j][keys[0]];
                        }
                        bar_data[j][fx] = result[j];
                    }
                }else{
                    node.send(bar_data);
                    bar_data[fx] = result;
                }
                msg.options[fx] = removeExtraOptions(call_fx._options);
                //msg.config = config; //DEBUG
                resolveComplete(fx);
            }catch(err){
                node.error("Analysis Error (" +fx+ "):  " + err.message, msg);
                resolveComplete(fx);
            }
        };
        
        // below is the "caller" statement
        for (var fn of allFunctions){
            if (config["enable" + fn]){ //ie 'enableRSI'
                // below is a store to confirm when all asyncs are done,
                completedFunctions[fn] = false;
                let parsed_config = {};
                for(var key in config){
                    let key_parts = key.split("_");
                    if(key_parts[0] == "option" && key_parts[1] == fn){
                        parsed_config[key_parts[2]] = config[key];
                    }
                }
                let options = {
                    ...parsed_config,
                    ...msg.options[fn],
                    ...{lazyEvaluation: false}
                };
                analyze(fn, special_data[fn] || input_data, options);
            }
        }
    }
    
    RED.nodes.registerType("alphacate",alphacateNode);
};
