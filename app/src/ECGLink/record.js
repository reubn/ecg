const record = (ecgLink, duration=10) => new Promise(resolve => {
  const localBuffer = []

  const durationNS = duration * 1000 * 1000
  let startTimestamp = null
  let endTimestamp = null

  const stop = () => {
    ecgLink.removeEventListener('reading', handler)
    ecgLink.recordingStatus = false
    ecgLink.dispatchEvent(new CustomEvent('recordingComplete', {detail: localBuffer}))
    resolve(localBuffer)
  }

  const handler = ({detail: [timestamp, reading]}) => {
    if(startTimestamp === null){
      startTimestamp = timestamp
      endTimestamp = startTimestamp + durationNS
    }

    ecgLink.dispatchEvent(new CustomEvent('recordingProgress', {detail: (timestamp - startTimestamp) / (1000 * 1000)}))
    if(timestamp <= endTimestamp) localBuffer.push([timestamp - startTimestamp, reading])
    else return stop()
  }

  ecgLink.recordingStatus = true
  ecgLink.dispatchEvent(new CustomEvent('recordingStarted'))
  ecgLink.addEventListener('reading', handler)
})

export default record
