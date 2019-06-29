const record = (ecgLink, duration) => new Promise(resolve => {
  const localBuffer = []

  const durationNS = duration * 1000 * 1000
  let startTimestamp = null
  let endTimestamp = null

  const stop = () => {
    ecgLink.removeEventListener('readings', handler)
    resolve(localBuffer)
  }

  const handler = ({detail: readings}) => {
    if(!startTimestamp){
      // console.log(readings)
      startTimestamp = readings[0][0]
      endTimestamp = startTimestamp + durationNS
    }

    for(const [timestamp, reading] of readings) {
      if(timestamp <= endTimestamp) localBuffer.push([timestamp, reading])
      else return stop()
    }
  }

  ecgLink.addEventListener('readings', handler)
})

window.record = record
export default record
