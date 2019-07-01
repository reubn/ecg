import React, {Suspense, useEffect, useState} from 'react'

import {ecgLink} from '../../ECGLink'

import Graph from '../Graph'
import Report from '../Report'

import noisySample from './noisySample'
import {app} from './style'

export default () => {
  useEffect(() => () => ecgLink.close(), [])

  const [test, setTest] = useState(true)
  const [recording, setRecording] = useState(noisySample)

  window.setTest = setTest.bind(null, true)
  window.setRecording = setRecording
  const content = (
    <>
      {test ? <Report recording={recording} /> : <Graph ecgLink={ecgLink} />}
    </>
  )

  return (
    <section className={app}>
      <Suspense fallback={<></>}>
        {content}
      </Suspense>
    </section>
  )
}
