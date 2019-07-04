import React from 'react'
import {extent} from 'd3-array'

import Trace, {xMaxExtent, xAccessor} from './Trace'

import {report, wrapper} from './style'

const Report = ({recording}) => {
  const [min, max] = extent(recording, xAccessor)
  const difference = max - min

  const numberOfTraces = Math.ceil(difference / xMaxExtent)

  const traces = Array.from({length: numberOfTraces}, (_, i) => {
    const lowerBound = i * xMaxExtent
    const upperBound = (i + 1) * xMaxExtent

    const lowerIndex = recording.findIndex(([ts]) => ts >= lowerBound)
    const upperIndex = recording.findIndex(([ts]) => ts > upperBound)

    return <Trace key={i} last={i == numberOfTraces - 1} data={recording.slice(lowerIndex, upperIndex)} />
  })

  return (
    <section className={report}>
    <span className={wrapper}>
      {traces}
      </span>
    </section>
  )
}

export default Report
