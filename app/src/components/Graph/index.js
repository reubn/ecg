import React, {useEffect, useState} from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY} from '@vx/curve'
import {scaleLinear} from '@vx/scale'
import {withParentSize} from '@vx/responsive'
import {Text} from '@vx/text'
import {extent, max, min} from 'd3-array'

import Diagram from './Diagram'
import Warning from './Warning'

import {graph, bpm as bpmStyle, units, symbol as symbolStyle, message as messageStyle} from './style'

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

  // const xAccessor = ([timestamp]) => timestamp
  const yAccessor = ([_, reading]) => reading

  const xPadding = 100
  const yPadding = 300

  const xScale = scaleLinear({
    range: [0, width - xPadding],
    domain: [0, dataBufferMaxLength] // extent(data, xAccessor)
  })

  const yScale = scaleLinear({
    range: [height - yPadding, 0],
    domain: extent(data, yAccessor)
  })

  const yScaleQRS = scaleLinear({
    range: [(height - yPadding) * 0.25, 0],
    domain: extent(qrsData, yAccessor)
  })

  const allElectrodesConnected = rightArm && leftArm && rightLeg
  const readyForData = connected && allElectrodesConnected

  const symbol = !connected
    ? <Warning className={symbolStyle} height={height * 0.4} y={height / 4} />
    : !allElectrodesConnected
      ? <Diagram rightArm={rightArm} leftArm={leftArm} rightLeg={rightLeg} className={symbolStyle} height={height / 2} y={height / 4} />
      : null

  const message = !connected
    ? 'Could not connect to ECG Unit'
    : !allElectrodesConnected
      ? 'Check Electrode Connections'
      : ''

  return (
    <>
      <section className={bpmStyle}>{allElectrodesConnected ? bpm : 0}<span className={units}>BPM</span></section>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={'var(--bg)'} rx={14} />
          {symbol}
          <Text
            x={width / 2}
            y={((connected && !allElectrodesConnected) ? 0.875 : 0.825) * height}
            width={height / 2}
            verticalAnchor="middle"
            textAnchor="middle"
            scaleToFit
            className={messageStyle}
          >{message}</Text>
        }
        <Group left={xPadding / 2} top={yPadding / 2}>
          <LinePath
            data={readyForData ? data : []}
            // x={d => xScale(xAccessor(d))}
            x={(d, i) => xScale(i)}
            y={d => yScale(yAccessor(d))}
            stroke={'var(--fg)'}
            strokeWidth={2.5}
            curve={curveMonotoneY}
            />
          </Group>
          <Group left={xPadding / 2} top={height - (yPadding / 3)}>
            <LinePath
              data={readyForData ? qrsData : []}
              // x={d => xScale(xAccessor(d))}
              x={(d, i) => xScale(i)}
              y={d => yScaleQRS(yAccessor(d))}
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
