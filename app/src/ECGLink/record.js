const record = (ecgLink, duration=10) => new Promise(resolve => {
  const localBuffer = []

  const durationNS = duration * 1000 * 1000
  let startTimestamp = null
  let endTimestamp = null

  const stop = () => {
    ecgLink.removeEventListener('reading', handler)
    ecgLink.dispatchEvent(new CustomEvent('recordingComplete', {detail: localBuffer}))
    resolve(localBuffer)
  }

  const handler = ({detail: [timestamp, reading]}) => {
    if(startTimestamp === null){
      startTimestamp = timestamp
      endTimestamp = startTimestamp + durationNS
    }
      if(timestamp <= endTimestamp) localBuffer.push([timestamp - startTimestamp, reading])
      else return stop()
  }

  ecgLink.addEventListener('reading', handler)
})

export default record
