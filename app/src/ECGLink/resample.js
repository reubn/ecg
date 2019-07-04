import {extent} from 'd3-array'

export default (orig, hz) => {
  const data = orig.slice()
  const [firstTimestamp, lastTimestamp] = extent(data, ([ts]) => ts)
  const extentTs = lastTimestamp - firstTimestamp
  const increment = (1 * 1000 * 1000) / hz
  const output = []

  let currentTimestamp = firstTimestamp
  while(currentTimestamp <= lastTimestamp){
    const minimumPossiblePosition = Math.floor(((currentTimestamp - firstTimestamp) / extentTs) * data.length)
    
    let oneTooFar
    for(let i = minimumPossiblePosition; i < data.length && !oneTooFar; i++) if(data[i][0] >= currentTimestamp) oneTooFar = i
    if(!oneTooFar) oneTooFar = data.length - 1

    if(data[oneTooFar][0] === currentTimestamp) output.push(data[oneTooFar])
    else {
      const oneTooSoon = oneTooFar - 1
      if(data[oneTooSoon][0] === currentTimestamp) output.push(data[oneTooSoon])
      else {
        const [beforeTimestamp, beforeReading] = data[oneTooSoon]
        const [afterTimestamp, afterReading] = data[oneTooFar]

        const farBetween = (currentTimestamp - beforeTimestamp) / (afterTimestamp - beforeTimestamp)
        const resampledValue = beforeReading + ((afterReading - beforeReading) * farBetween)
        output.push([currentTimestamp, resampledValue])
      }
    }

    currentTimestamp += increment
  }

  return output
}
