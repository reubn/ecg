import React from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY} from '@vx/curve'
import {scaleLinear} from '@vx/scale'
import {Grid, GridColumns} from '@vx/grid'
import {AxisBottom} from '@vx/axis'
import {extent} from 'd3-array'

import {trace, gridMajor, gridMinor, label, line} from './style'

export default ({duration, voltage: voltageMinimum, data}) => {
  const xAccessor = ([timestamp]) => timestamp
  const yAccessor = ([_, reading]) => reading

  let [yMin, yMax] = extent(data, yAccessor)
  let yExtent = yMax - yMin
  const yMiddle = (yMin + yMax) / 2;

  if(yExtent < voltageMinimum) {
    ([yMin, yMax] = [yMiddle - (voltageMinimum / 2), yMiddle + (voltageMinimum / 2)])
    yExtent = voltageMinimum
  }


  const width = (duration / (1000 * 1000)) * 25 // 25mm/s
  const height = yExtent * 1000 * 10 // 10mm/mv

  const [[lowestTimestamp]] = data

  const xScale = scaleLinear({
    range: [0, width],
    domain: [lowestTimestamp, lowestTimestamp + duration]
  })

  const yScale = scaleLinear({
    range: [height, 0],
    domain: [yMin, yMax]
  })


  const xMajorTickInterval = 0.2 * 1000 * 1000 // ns
  const xMajorTickValues = Array.from({length: Math.ceil(duration / xMajorTickInterval)}, (_, i) => lowestTimestamp + (i * xMajorTickInterval))

  const xMinorTickInterval = xMajorTickInterval / 5 // ns
  const xMinorTickValues = Array.from({length: Math.ceil(duration / xMinorTickInterval)}, (_, i) => lowestTimestamp + (i * xMinorTickInterval))

  const yMajorTickInterval = 0.5 / 1000 // V
  const yMajorTickValues = Array.from({length: Math.ceil(yExtent / yMajorTickInterval)}, (_, i) => yMin + (i * yMajorTickInterval))

  const yMinorTickInterval = yMajorTickInterval / 5 // V
  const yMinorTickValues = Array.from({length: Math.ceil(yExtent / yMinorTickInterval)}, (_, i) => yMin + (i * yMinorTickInterval))

  const secondsTickInterval = 1 * 1000 * 1000 // ns
  const secondsTickValues = Array.from({length: Math.ceil(duration / secondsTickInterval) + 1}, (_, i) => lowestTimestamp + (i * secondsTickInterval))

  return (
    <svg width={`${width + 5}mm`} height={`${height + 5}mm`} viewBox={`0 0 ${width + 5} ${height + 5}`} className={trace}>
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
          rowTickValues={yMinorTickValues}
          columnTickValues={xMinorTickValues}
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
          rowTickValues={yMajorTickValues}
          columnTickValues={xMajorTickValues}
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
          tickValues={secondsTickValues}
        />
        <AxisBottom
            hideAxisLine
            hideTicks
            tickLength={0}
            top={height}
            scale={xScale}
            tickFormat={d => `${Math.floor(d / (1000 * 1000))}s`}
            stroke="#CCCCCC"
            strokeWidth={0.25}
            tickValues={secondsTickValues}
            tickClassName={label}
            tickTransform="translate(0.5, -7)"
            tickLabelProps={(value, index) => ({
              fill: "#CCCCCC",
              fontSize: 2,
              fontWeight: 600,
              textAnchor: 'start'
            })}
          />
        <LinePath
          data={data}
          x={d => xScale(xAccessor(d))}
          y={d => yScale(yAccessor(d))}
          stroke={'#CD0A20'}
          strokeWidth={0.25}
          curve={curveMonotoneY}
          className={line}
          />
          <rect x={0} y={0} width={width} height={height} fill={'none'} strokeWidth={0.25} stroke={'#CCCCCC'} />
        </Group>
    </svg>
  )
}
