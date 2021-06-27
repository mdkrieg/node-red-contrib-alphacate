//retrieve indicator module via accessor or alias
const alphacate = require('alphacate');

const LWMA = alphacate.LWMA;
const BB = alphacate.BollingerBands;
const MACD = alphacate.MACD;


const fs = require('fs');

//do computation asynchronously
let run = async (msg) => {
    try{
        //pass optional configuration object into the constructor
        let lwma = new LWMA( {periods: 4} );
        let bb = new BB( {periods: 4} );
        let macd = new MACD({fastPeriods:4});
        let rawdata = fs.readFileSync('OBV-data.json');
        let data = JSON.parse(rawdata);
        //console.log(data);

        //let data = [61.815,61.73,61.64,61.46,61.515,61.525,61.395,61.33,61.365,61.325,61.745,61.775,61.555,61.55,61.775,61.75,61.53,61.46,61.475,61.435,61.385,61.25,61.34,61.62,61.6,61.61,61.545,61.445,61.44,61.385,61.41,61.4,61.33,61.36,61.33,61.52,60.61,60.42,60.71,60.495,60.775,60.725,60.72,60.56,60.5,60.475,60.6,60.66,60.525,60.66,60.83,60.87,60.8,60.87,60.57,60.64,60.68,60.68,60.64,60.56,60.685,60.77,60.18,60.555,60.73,60.68,60.63,60.57,60.51,60.585,60.43,60.32,60.505,60.58,60.545,60.655,60.91,60.67,60.77,60.845,60.89,60.88,60.85,60.92,60.94,60.95,60.925,60.78,62.5,61.96,62.37,61.87,61.7,61.86,62.19,62.24,62.285,62.17,62.21,61.86,61.665,61.5,61.67,61.495,61.49,61.57,61.64,61.9,61.85,61.605,61.64,61.9,61.78,61.85,61.75,61.92,61.84,61.52,61.12,61.04,60.94,60.62,60.4,60.355,60.295,59.775,59.775,59.51,59.67,60.065,60.195,60.35,60.49,60.34,60.255,60.105,59.9,60.02,60.16,60.095,60.115,60.065,59.1,58.94,58.88,58.675,58.565,58.84,59.07,59.16,59.135,59.52,59.41,59.385,59.385,59.245,59.24,59.435,59.37,59.34,59.225,59.14,59.1,58.91,58.905,58.945,58.985,58.94,58.75,58.9,58.93,59.095,59.38,59.3,59.335,59.095,59.07,59.19,59.13,59.15,59.045,59.17,59.16,59.39,59.295,59.32,59.38,59.52,59.43,59.45,59.45,59.415,59.235,59.17,59.29,59.54,59.29,59.295,59.31,59.44,59.23,59.395,59.325,59.305,59.195,59.19,59.25,59.295,59.215,59.235,59.27,59.155,59.215,59.275,59.305,59.4,59.455,59.34,59.415,59.475,59.38,59.255,59.78,60.03,59.92,59.87,59.54,59.7,59.685,59.7,59.72,59.695,59.87,59.845,59.88,59.9,60.02,60.185,60.11,60.185,60.225,60.33,60.365,60.36,60.37,60.34,60.235,60.11,60.06,60.03,60.17,60.185,59.975,59.92,60.07,59.955,59.885,59.92,59.835,59.895,59.95,60.145,59.99,59.87,59.93,59.935,60.035,60.2,60.17,60.175,60.19,60.17,60.22,60.03,60.195,60.12,60.54,60.255,60.42,60.345,60.365,60.3,60.185,60.22,60.225,60.16,60.215,60.2,60.095,60.065,60.155,60.225,60.235,60.365,60.35,60.465,60.525,60.41,60.3,60.26];
        let OBV = new alphacate.OBV({lazyEvaluation:true});
        OBV.setValues(data);
        let result = await OBV.calculate();
        console.log(result);
        //set data series
        /*
        lwma.setValues( data );
        bb.setValues( data );
        macd.setValues(data);
/**/
        //invoke calculate() to compute and retrieve result collection
        //an error will be throw if passed data serie or options are invalid
        /*
        let lwmaCollection = await lwma.calculate();
        let bbCollection = await bb.calculate();
        let macdCollection = await macd.calculate();
        let macdResult = [];
        for(let i=0, len=lwmaCollection.length; i<len; i++){
            //console.log(`Price: ${lwmaCollection[i].price}, LWMA: ${lwmaCollection[i].lwma}, BB Upper: ${bbCollection[i].upper}`);
            macdResult.push({
                slow_ema:   macdCollection[0].slow_ema[i],
                fast_ema:   macdCollection[0].fast_ema[i],
                signal_ema: macdCollection[0].signal_ema[i],
                macd:       macdCollection[0].macd[i],
                price:      macdCollection[0].prices[i]
            });
        }
        /*
        console.log(macdResult[20]);
        console.log(macd._options);
        console.log(msg);
/**/
    }
    catch( err ){
        console.log(err.message);
    }
};

run("foo");
