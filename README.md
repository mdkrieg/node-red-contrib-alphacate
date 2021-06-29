# node-red-contrib-alphacate
For calculating technical indicators for stock trading.

Designed to work seamlessly with Alpaca via [**node-red-contrib-alpaca**](https://flows.nodered.org/node/node-red-contrib-alpaca) or [**node-red-contrib-alpaca-simple**](https://flows.nodered.org/node/node-red-contrib-alpaca-simple).

Based on npm package **alphacate**, link to GitHub for more information: https://github.com/codeplayr/alphacate.

## Features

* Connects seamlessly with Alpaca's getBars function
* Calculate several indicators at once
* Calculate several tickers' data at once

![image](https://user-images.githubusercontent.com/66855036/123717050-a523e900-d841-11eb-8295-351c4faff6ed.png)

### List of supported indicators:
 * **ATR** - AverageTrueRange
 * **BB** - BollingerBands
 * **EMA** - ExponentialMovingAverage
 * **LWMA** - LinearlyWeightedMovingAverage
 * **MACD** - MovingAverageConvergenceDivergence
 * **MFI** - MoneyFlowIndex
 * **OBV** - OnBalanceVolume
 * **RSI** - RelativeStrengthIndex
 * **SMA** - SimpleMovingAverage
 * **SMMA** - SmoothedMovingAverage
 * **SO** - StochasticOscillator
 * **ROC** - RateOfChange
 * **WMA** - WeightedMovingAverage

## Instructions

There are **two valid options** for the format of the incoming msg.payload.

First option is a single array of bars:

```
msg.payload = [
    {
        closePrice,
        openPrice,
        highPrice,
        lowPrice,
        volume
    },
    ...
]
```

Second option is an object of tickers that each contain an array of bars as outlined above:

```
msg.payload = {
    TICKER1:[
        Array of Bars
    ],
    TICKER2:[
        Array of Bars
    ]
}
```

## Release Notes
1.0.1 - documentation and cleanup

1.0.0 - initial release

## TODO / Roadmap
* [ ] !!! Add ability to change calculation settings / options
* [ ] Include examples
* [ ] Create options to customize input data scheme
* [ ] (similarly) Create options to connect seamlessly to other data sources (alphavantage, finnhub, polygon, etc)
