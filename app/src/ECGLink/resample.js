export default (orig, hz) => {
  const data = [...orig]
  const [[firstTimestamp]] = data
  const [lastTimestamp] = data[data.length - 1]
  const increment = (1 * 1000 * 1000) / hz

  const output = []

  let currentTimestamp = firstTimestamp
  while(currentTimestamp <= lastTimestamp){
    const oneTooFar = data.findIndex(([ts]) => ts >= currentTimestamp)
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
