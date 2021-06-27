
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
            node.status({text:"calculating...",fill:"blue"});
            
            let input_data = [];
            let special_data = {
                ATR: [],
                MFI: [],
                OBV: []
            };
            for (var dp in msg.payload){
                input_data.push(msg.payload[dp][config.useData]);
                // specify here to handle indicators----
                // with non-default input requirements--
                special_data.ATR.push({
                    high:  msg.payload[dp].highPrice,
                    low:   msg.payload[dp].lowPrice,
                    close: msg.payload[dp].closePrice
                });
                special_data.MFI.push({
                    high:  msg.payload[dp].highPrice,
                    low:   msg.payload[dp].lowPrice,
                    close: msg.payload[dp].closePrice,
                    volume:msg.payload[dp].volume
                });
                special_data.OBV.push({
                    price: msg.payload[dp][config.useData],
                    volume:msg.payload[dp].volume
                });
            }
            if (!config.mergeData){
                msg.data = JSON.parse(JSON.stringify(msg.payload));
                msg.payload = {};
            }
            msg.options = {};
            // call all the enabled indicators
            let completedFunctions = {}; // used as "done" test
            // define calculation handler
            let resolveComplete = function(fx, err = false){
                completedFunctions[fx] = true;
                for(var c in completedFunctions){
                    if(!completedFunctions[c]) return;
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
                        for (var j in msg.payload){
                            delete result[j].price;
                            let keys = Object.keys(result[j]);
                            if (keys.length == 1){
                                result[j] = result[j][keys[0]];
                            }
                            msg.payload[j][fx] = result[j];
                        }
                    }else{
                        msg.payload[fx] = result;
                    }
                    msg.options[fx] = call_fx._options;
                    msg.config = config;
                    resolveComplete(fx);
                }catch(err){
                    node.error("Analysis Error (" +fx+ "):  " + err.message, msg);
                    resolveComplete(fx);
                }
            };
            
            for (var fn of allFunctions){
                if (config["enable" + fn]){ //ie 'enableRSI'
                    // to confirm when all asyncs are done,
                    completedFunctions[fn] = false;
                    let options = {
                        ...config.options,
                        ...msg.options,
                        ...{lazyEvaluation: false}
                    };
                    analyze(fn, special_data[fn] || input_data, options);
                }
            }
        });
    }
    
    RED.nodes.registerType("alphacate",alphacateNode);
};
