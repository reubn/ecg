import React, {Suspense, useEffect, useState} from 'react'

import {ecgLink} from '../../ECGLink'

import Graph from '../Graph'
import Report from '../Report'

import {app} from './style'

export default () => {
  useEffect(() => () => ecgLink.close(), [])
  const [reportVisibile, setReportVisibile] = useState(false)
  const [recording, setRecording] = useState({})

  const content = (
    <>
      {reportVisibile ? <Report recording={recording} /> : <Graph ecgLink={ecgLink} />}
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
