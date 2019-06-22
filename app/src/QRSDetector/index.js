import Fili  from 'fili'
import {ma} from 'moving-averages'

const f1 = 8, f2 = 20, w1 = 35, w2 = 220, offset = 8


var iirCalculator = new Fili.CalcCascades();

// calculate filter coefficients
var iirFilterCoeffs = iirCalculator.bandpass({
    order: 3, // cascade 3 biquad filters (max: 12)
    characteristic: 'butterworth',
    Fs: 1000, // sampling frequency
    Fc: (f2 - f1) / 2 + f1, // cutoff frequency / center frequency for bandpass, bandstop, peak 14
    BW: (f2 - f1) / 2, // bandwidth only for bandstop and bandpass filters - optional 6
  });

// create a filter instance from the calculated coeffs
var iirFilter = new Fili.IirFilter(iirFilterCoeffs);

// let eAL = 1/f1, eAH = 1/f2
// let eSL = 0, eSH = 0
// const bandpass = reading => {
//   const band = f2 - f1
//
//   eSL = (eAL * reading) + ((1 - eAL) * eSL)
//   eSH = (eAH * reading) + ((1 - eAH) * eSH)
//
//   // const bandpass = eSH - eSL
//   // const bandpass =
//   // const bandpass = Math.max(eSH, Math.min(eSL, reading))
//   return eSL - eSH
// }
const downPeriod = 50
let on = []
let last = -Infinity
let beats = []
const beatsLimit = 10
export default (reading, buffer) => {
  const bandpassed = iirFilter.singleStep(reading)
  // const squared = bandpassed ** 2
  // const movingAverageQRS = [...buffer.slice(-17), reading].reduce((sum, v) => sum + v, 0) / 18
  // // console.log(movingAverageQRS)
  // return movingAverageQRS
// console.log(bandpassed)
  const decision = bandpassed > 100
  if(on.length === downPeriod) on.shift()
  const downEnough = on.every(x => !x)
  on.push(decision)

  const finalDecision = decision && downEnough

  if(finalDecision) {
    const now = performance.now()
    const bpm = 60 / (now - last) * 1000
    last = now
    if(beats.length === beatsLimit) beats.shift()
    beats.push(bpm)

    console.log(Math.floor(beats.reduce((sum, x) => sum + x, 0) / beats.length))
  }

  return finalDecision ? 1 : 0
}
