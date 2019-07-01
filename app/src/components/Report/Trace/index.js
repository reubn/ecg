import React from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY} from '@vx/curve'
import {scaleLinear} from '@vx/scale'
import {Grid, GridColumns} from '@vx/grid'
import {extent} from 'd3-array'

import {trace, gridMajor, gridMinor} from './style'

export default ({duration, voltage, data}) => {
  const width = 250 // mm
  const height = 30 // mm

  const [[lowestTimestamp]] = data

  const xAccessor = ([timestamp]) => timestamp - lowestTimestamp
  const yAccessor = ([_, reading]) => reading

  const xScale = scaleLinear({
    range: [0, width],
    domain: [0, duration],
    nice: true
  })

  const yScale = scaleLinear({
    range: [height, 0],
    domain: extent(data, yAccessor),
    nice: true
  })

  const xMajorTickInterval = 0.2 * 1000 * 1000 // ns
  const xMinorTickInterval = xMajorTickInterval / 5 // V

  const yMajorTickInterval = 0.5 / 1000 // ns
  const yMinorTickInterval = yMajorTickInterval / 5 // V

  const secondsTickInterval = 1 * 1000 * 1000 // ns

  return (
    <svg width={`${width + 10}mm`} height={`${height + 10}mm`} viewBox={`0 0 ${width + 10} ${height + 10}`} className={trace}>
      <Group top={1} left={1}>
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
        <GridColumns
          left={0}
          top={height}
          className={gridMajor}
          scale={xScale}
          width={width}
          height={3}
          strokeWidth={0.25}
          stroke="#CCCCCC"
          numTicks={duration / secondsTickInterval}
        />
        <LinePath
          data={data}
          x={d => xScale(xAccessor(d))}
          y={d => yScale(yAccessor(d))}
          stroke={'#CD0A20'}
          strokeWidth={0.25}
          curve={curveMonotoneY}
          />
          <rect x={0} y={0} width={width} height={height} fill={'none'} strokeWidth={0.25} stroke={'#CCCCCC'} />
        </Group>
    </svg>
  )
}
