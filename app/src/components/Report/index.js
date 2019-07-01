import React from 'react'

import Trace from './Trace'

import {report} from './style'

const Report = ({recording}) => {
  const traceDuration = 10 * 1000 * 1000 // ns
  const traceVoltage = 3 / 1000 // V

  const lowest = recording[0][0]
  const highest = recording[recording.length - 1][0]
  const difference = highest - lowest

  const numberOfTraces = Math.ceil(difference / traceDuration)

  const traceData = Array.from({length: numberOfTraces}, (_, i) => {
    const lowerBound = i * traceDuration
    const upperBound = (i + 1) * traceDuration

    const lowerIndex = recording.findIndex(([ts]) => ts >= lowerBound)
    const upperIndex = recording.findIndex(([ts]) => ts > upperBound)

    return recording.slice(lowerIndex, upperIndex)
  })

  return (
    <section className={report}>
      {traceData.map((data, i) => <Trace key={i} duration={traceDuration} voltage={traceVoltage} data={data} />)}
    </section>
  )
}

export default Report
