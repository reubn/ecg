import React, {Suspense, useEffect, useState} from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY, curveBasis} from '@vx/curve'
import {scaleTime, scaleLinear} from '@vx/scale'
import {extent, max, min} from 'd3-array'

import ECGLink from '../../ECGLink'

const delay = -20

export default ({width=1500, height=500}) => {
  const [{data, maxLength, leads, connected}, setData] = useState({connected: false, data: [], maxLength: 0, leads: {}})
  const [{data: testData}, setTestData] = useState({data: []})

  useEffect(() => {
    const ecgLink = new ECGLink()
        // ecgLink.addEventListener('data', ({detail}) => setData(detail))
    const update = () => {
      setTestData({data: ecgLink.dataBufferTest.slice(0, delay)})
      setData({
      data: ecgLink.dataBuffer.slice(0, delay),
      maxLength: ecgLink.dataBufferMaxLength + delay,
      leads: ecgLink.leads,
      connected: ecgLink.connected
    })
    window.requestAnimationFrame(update)
  }


    ecgLink.addEventListener('open', () => window.requestAnimationFrame(update))
    ecgLink.addEventListener('close', () => window.cancelAnimationFrame(update))

    return () => ecgLink.close()
  }, [])
// console.log({data, maxLength, leads, connected})
  const xPadding = 100
  const yPadding = 300

  const xScale = scaleTime({
    range: [0, width - xPadding],
    domain: [0, maxLength]
  })

  const yScale = scaleLinear({
    range: [height - yPadding, 0],
    domain: extent(data)
  })

  const yScaleTest = scaleLinear({
    range: [height - yPadding, 0],
    domain: extent(testData)
  })

  let statusColour = 'hsl(0, 0%, 20%)';
  if(connected) statusColour = 'hsl(200, 90%, 50%)'
  if(connected && leads.positive && leads.negative) statusColour = 'hsl(1, 100%, 60%)'

  return (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} fill={statusColour} rx={14} />
      <Group left={xPadding / 2} top={yPadding / 2}>
      <LinePath
        data={testData}
        x={(d, i) => xScale(i)}
        y={d => yScaleTest(d)}
        stroke={'rgba(0, 0, 0, 0.25)'}
        strokeWidth={2}
        curve={curveMonotoneY}
      /><LinePath
          data={data}
          x={(d, i) => xScale(i)}
          y={d => yScale(d)}
          stroke={'#fff'}
          strokeWidth={2}
          curve={curveMonotoneY}
        />

      </Group>
    </svg>
  )
}
