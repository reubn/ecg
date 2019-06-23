import React, {Suspense, useEffect} from 'react'

import {ecgLink} from '../../ECGLink'

import Graph from '../Graph'
import Leads from '../Leads'

import {app} from './style'

export default () => {
  useEffect(() => () => ecgLink.close(), [])

  const content = (
    <>
      <Graph ecgLink={ecgLink} />
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
