import React, {useState, useEffect} from 'react'
import {Text} from '@vx/text'

import {recordContainer, recordIcon, middleDot, length, active} from './style'

const recordingDuration = 10

export default ({ecgLink}) => {
  const [recordingStatus, setRecordingStatus] = useState(ecgLink.recordingStatus ? 'recording' : 'dormant')
  const [secsRemaining, setSecsRemaining] = useState(false)
  const [ttl, setTTL] = useState(false)
  const [ttlCanceled, setTTLCanceled] = useState(false)

  useEffect(() => {
    if(ttl === false) return
    if(ttlCanceled) return setTTLCanceled(false)
    if(ttl === 0) {
      setRecordingStatus('recording')
      setSecsRemaining(recordingDuration)
      setTTL(false)
      ecgLink.record(recordingDuration)
      return
    }
    setTimeout(() => setTTL(ttl - 1), 1000)
  }, [ttl])

  useEffect(() => {
    const handler = ({detail}) => {
      setSecsRemaining(recordingDuration - Math.ceil(detail))
    }
    ecgLink.addEventListener('recordingProgress', handler)
    return () => ecgLink.removeEventListener('recordingProgress', handler)
  }, [])

  const message = ({
    recording: `Recording`,
    dormant: '',
    imminent: 'Get Ready'
  })[recordingStatus] || ''

  const number = ({
    recording: secsRemaining,
    dormant: '',
    imminent: ttl
  })[recordingStatus] || ''

  const onClick = () => {
    if(recordingStatus === 'recording') return console.log('END RECORDING')
    if(recordingStatus === 'imminent') {
      setRecordingStatus('dormant')
      setTTLCanceled(true)

    }
    if(recordingStatus === 'dormant') {
      setRecordingStatus('imminent')
      setTTL(5)
    }
  }

  const recordContainerClass = `${recordContainer} ${recordingStatus !== 'dormant' ? active : ''}`

  return (
    <section className={recordContainerClass} onClick={onClick}>
      <svg viewBox="0 0 44 44" version="1.1" xmlns="http://www.w3.org/2000/svg" className={recordIcon}>
      <defs>
        <mask id="cut">
          <rect width="100%" height="100%" fill="white" /><Text
        x={22}
        y={22}
        width={16}
        style={{fontSize: '1.1rem'}}
        verticalAnchor="middle"
        textAnchor="middle"
        className={length}
        style={{opacity: recordingStatus !== 'dormant' ? 1 : undefined}}
      >{number}</Text>
      </mask>
    </defs>
        <circle id="Oval" mask="url(#cut)" fill="#FFFFFF" cx="22" cy="22" className={middleDot} style={{r: recordingStatus !== 'dormant' ? 15 : undefined}} />
        <circle id="Oval" fill="none" stroke="#FFFFFF" strokeWidth="4" cx="22" cy="22" r="20" />

      </svg>
      {message}
    </section>
  )
}
