import {CalcCascades, IirFilter}  from 'fili'

const f1 = 8  // Hz - Fast QRS Detection with an Optimized Knowledge-Based Method
const f2 = 20 // Hz - Fast QRS Detection with an Optimized Knowledge-Based Method

const windowSize = 500 // Size of window to look back on
const downPeriod = 60 // Refractory Period in which another positive will not be generated
const threshold = 0.7 // Threshold of window maximum that must be reached
const beatsLimit = 4

const iirCalculator = new CalcCascades()

const bandpassCoefficients = iirCalculator.bandpass({
    order: 3,
    characteristic: 'butterworth',
    Fs: 1000,
    Fc: (f2 - f1) / 2 + f1,
    BW: (f2 - f1) / 2
  })

const iirFilter = new IirFilter(bandpassCoefficients)

let risingEdgeFilter = []
let last = -Infinity
let beats = []

export default (reading, buffer) => {
  const bandpassed = iirFilter.singleStep(reading)
  const bandpassedBuffer = iirFilter.multiStep(buffer.slice(-windowSize).map(([_, reading]) => reading))
  const max = Math.max(...bandpassedBuffer)

  const decision = bandpassed >= max * threshold

  if(risingEdgeFilter.length === downPeriod) risingEdgeFilter.shift()
  const isRisingEdge = risingEdgeFilter.every(x => !x)
  risingEdgeFilter.push(decision)

  return decision && isRisingEdge ? 1 : 0
}
