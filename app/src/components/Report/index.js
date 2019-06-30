import React from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY, curveBasis} from '@vx/curve'
import {scaleLinear} from '@vx/scale'
import {withScreenSize} from '@vx/responsive'
import {Grid} from '@vx/grid'
import {extent, max, min} from 'd3-array'

import {report, gridMajor, gridMinor} from './style'

const Trace = ({screenWidth, duration, voltage, data}) => {
  const width = 250 // mm
  const height = 30 // mm

  const xAccessor = ([timestamp]) => timestamp
  const yAccessor = ([_, reading]) => reading

  const extentX = extent(data, xAccessor)
  const xScale = scaleLinear({
    range: [0, width],
    domain: [0, duration],
    nice: true
  })

  const extentY = extent(data, yAccessor)
  const yScale = scaleLinear({
    range: [height, 0],
    domain: extentY,
    nice: true
  })

  const xMajorTickInterval = 0.2 * 1000 * 1000
  const xMinorTickInterval = xMajorTickInterval / 5

  const yMajorTickInterval = 0.5 / 1000
  const yMinorTickInterval = yMajorTickInterval / 5

  return (
    <svg width={`${width}mm`} height={`${height}mm`} viewBox={`0 0 ${width} ${height}`}>
      <Grid
        left={0}
        top={0}
        className={gridMinor}
        xScale={xScale}
        yScale={yScale}
        width={width}
        height={height}
        strokeWidth={0.25}
        stroke="#E5E5E5"
        numTicksRows={voltage / yMinorTickInterval}
        numTicksColumns={duration / xMinorTickInterval}
      />
      <Grid
        left={0}
        top={0}
        className={gridMajor}
        xScale={xScale}
        yScale={yScale}
        width={width}
        height={height}
        strokeWidth={0.25}
        stroke="#CCCCCC"
        numTicksRows={voltage / yMajorTickInterval}
        numTicksColumns={duration / xMajorTickInterval}
      />
      <LinePath
        data={data}
        x={d => xScale(xAccessor(d))}
        y={d => yScale(yAccessor(d))}
        stroke={'#CD0A20'}
        strokeWidth={0.25}
        curve={curveBasis}
        />

    </svg>
  )
}

const Report = ({screenWidth, recording}) => {
  const traceDuration = 10 * 1000 * 1000 // ns
  const traceVoltage = 3 / 1000 // V

  const {result: traceData} = recording.reduce(({chunkNumber, result}, [timestamp, reading]) => {
    if(timestamp > (traceDuration * (chunkNumber + 1))) chunkNumber++

    const currentChunk = result[chunkNumber] || []
    const adjustedTimestamp = timestamp - (traceDuration * chunkNumber)
    const pair = [adjustedTimestamp, reading]

    result[chunkNumber] = [...currentChunk, pair]

    return {
      chunkNumber,
      result
    }
  }, {chunkNumber: 0, result: []})

  return (<>
    {traceData.map((data, i) => <Trace key={i} screenWidth={screenWidth} duration={traceDuration} voltage={traceVoltage} data={data} />)}
  </>)
}

const ReportWithScreenSize = withScreenSize(Report)

export default props => (
  <section className={report}>
    <ReportWithScreenSize {...props} />
  </section>
)
