import React, {useEffect, useState} from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY} from '@vx/curve'
import {scaleLinear} from '@vx/scale'
import {withParentSize} from '@vx/responsive'
import {extent, max, min} from 'd3-array'

import Diagram from './Diagram'

import {graph, bpm as bpmStyle, units, diagram} from './style'

const delay = -20

const Graph = ({parentWidth: width, parentHeight: height, ecgLink}) => {
  const dataBufferMaxLength = ecgLink.dataBufferMaxLength + delay

  const [{data, qrsData, electrodes: {rightArm, leftArm, rightLeg}, bpm, connected}, setData] = useState({
    connected: false,
    data: [],
    qrsData: [],
    electrodes: {},
    bpm: 0
  })
  const update = () => {
    setData({
      data: ecgLink.dataBuffer.slice(0, delay),
      qrsData: ecgLink.dataBufferQRS.slice(0, delay),
      electrodes: ecgLink.electrodes,
      bpm: ecgLink.bpm,
      connected: ecgLink.connected
    })
    window.requestAnimationFrame(update)
  }

  useEffect(() => {
    if(ecgLink.connected) window.requestAnimationFrame(update)
    else ecgLink.addEventListener('open', () => window.requestAnimationFrame(update))
    ecgLink.addEventListener('close', () => window.cancelAnimationFrame(update))
  }, [])

  const allConnected = rightArm && leftArm && rightLeg

  const xPadding = 100
  const yPadding = 300

  const xScale = scaleLinear({
    range: [0, width - xPadding],
    domain: [0, dataBufferMaxLength]
  })

  const yScale = scaleLinear({
    range: [height - yPadding, 0],
    domain: extent(data)
  })

  const yScaleQRS = scaleLinear({
    range: [(height - yPadding) * 0.25, 0],
    domain: extent(qrsData)
  })
  // if(rightArm && leftArm) console.log({leftArm, rightArm})
  return (
    <>
      <section className={bpmStyle}>{bpm}<span className={units}>BPM</span></section>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={'var(--bg)'} rx={14} />
        <Diagram rightArm={rightArm} leftArm={leftArm} rightLeg={rightLeg} className={diagram} height={height / 2} y={height / 4} />
        <Group left={xPadding / 2} top={yPadding / 2}>
          <LinePath
              data={allConnected ? data : []}
              x={(d, i) => xScale(i)}
              y={d => yScale(d)}
              stroke={'var(--fg)'}
              strokeWidth={2.5}
              curve={curveMonotoneY}
            />
          </Group>
          <Group left={xPadding / 2} top={height - (yPadding / 3)}>
            <LinePath
              data={allConnected ? qrsData : []}
              x={(d, i) => xScale(i)}
              y={d => yScaleQRS(d)}
              stroke={'rgba(0, 0, 0, 0.25)'}
              strokeWidth={2}
              curve={curveMonotoneY}
            />
        </Group>
      </svg>
    </>
  )
}

const GraphWithParentSize = withParentSize(Graph)

export default props => <section className={graph}><GraphWithParentSize {...props} /></section>
