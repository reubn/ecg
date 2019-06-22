import React, {Suspense} from 'react'

import Graph from '../Graph'

import {app} from './style'

export default () => {

  const content = (
    <Graph />
  )

  return (
    <section className={app}>
      <Suspense fallback={<></>}>
        {content}
      </Suspense>
    </section>
  )
}
