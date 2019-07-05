const record = (ecgLink, duration) => new Promise(resolve => {
  const localBuffer = []

  const durationNS = duration * 1000 * 1000
  let startTimestamp = null
  let endTimestamp = null

  const stop = () => {
    ecgLink.removeEventListener('reading', handler)
    resolve(localBuffer)
  }

  const handler = ({detail: [timestamp, reading]}) => {
    if(startTimestamp === null){
      // console.log(readings)
      startTimestamp = timestamp
      endTimestamp = startTimestamp + durationNS
    }
// console.log({startTimestamp, endTimestamp, timestamp})
      if(timestamp <= endTimestamp) localBuffer.push([timestamp - startTimestamp, reading])
      else return stop()
  }

  ecgLink.addEventListener('reading', handler)
})

window.record = record
export default record
