import React from 'react'

import {Group} from '@vx/group'
import {LinePath} from '@vx/shape'
import {curveMonotoneY} from '@vx/curve'
import {scaleLinear} from '@vx/scale'
import {Grid, GridColumns} from '@vx/grid'
import {AxisBottom} from '@vx/axis'
import {extent} from 'd3-array'

import {floor, ceil} from './round'

import {trace, gridMajor, gridMinor, label, line} from './style'

const xAccessor = ([timestamp]) => timestamp
const yAccessor = ([_, reading]) => reading

const xScaleFactor = 25 / (1000 * 1000) // 25mm/s
const yScaleFactor = 1000 * 10 // 10mm/mV

const xMajorTickInterval = 0.2 * 1000 * 1000 // ns
const xMinorTickInterval = xMajorTickInterval / 5 // ns

const yMajorTickInterval = 0.5 / 1000 // V
const yMinorTickInterval = yMajorTickInterval / 5 // V

const secondsTickInterval = 1 * 1000 * 1000 // ns

const xMaxExtent = 10 * 1000 * 1000 // ns
const yMinExtent = 3 / 1000 // V

export default ({duration, data}) => {
  const [yMinBase, yMaxBase] = extent(data, yAccessor)
  let [yMin, yMax] = [floor(yMinBase, yMajorTickInterval), ceil(yMaxBase, yMajorTickInterval)]
  let yExtent = yMax - yMin
  const yMiddle = (yMin + yMax) / 2;

  if(yExtent < yMinExtent) {
    ([yMin, yMax] = [yMiddle - (yMinExtent / 2), yMiddle + (yMinExtent / 2)])
    yExtent = yMinExtent
  }

  const [xMinBase, xMaxBase] = extent(data, xAccessor)
  const [xMin, xMax] = [floor(xMinBase, secondsTickInterval), ceil(xMaxBase, secondsTickInterval)]
  const xExtent = xMax - xMin

  const width = xExtent * xScaleFactor
  const height = yExtent * yScaleFactor

  const xScale = scaleLinear({
    range: [0, width],
    domain: [xMin, xMax]
  })

  const yScale = scaleLinear({
    range: [height, 0],
    domain: [yMin, yMax]
  })

  const xMajorTickValues = Array.from({length: Math.ceil(xExtent / xMajorTickInterval)}, (_, i) => xMin + (i * xMajorTickInterval))
  const xMinorTickValues = Array.from({length: Math.ceil(xExtent / xMinorTickInterval)}, (_, i) => xMin + (i * xMinorTickInterval))

  const yMajorTickValues = Array.from({length: Math.ceil(yExtent / yMajorTickInterval)}, (_, i) => yMin + (i * yMajorTickInterval))
  const yMinorTickValues = Array.from({length: Math.ceil(yExtent / yMinorTickInterval)}, (_, i) => yMin + (i * yMinorTickInterval))

  const secondsTickValues = Array.from({length: Math.ceil(xExtent / secondsTickInterval) + 1}, (_, i) => Math.min(xScale.invert(width), xMin + (i * secondsTickInterval)))

  const calibrationStart = [
    xMax - 2 * xMajorTickInterval - xMinorTickInterval, yMax - (3 * yMajorTickInterval)
  ]
  const calibrationTraceData = [
    [+xMinorTickInterval, 0],
    [0, +2 * yMajorTickInterval],
    [+2 * yMajorTickInterval, 0],
    [+xMajorTickInterval, 0],
    [0, -2 * yMajorTickInterval],
    [+xMinorTickInterval, 0]
  ].reduce((pre, [dx, dy], _i, _a, [x, y] = pre.pop()) => [...pre, [x, y], [x + dx, y + dy]], [calibrationStart])

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
            tickFormat={d => `${Math.round(d / (1000 * 1000))}s`}
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
          data={calibrationTraceData}
          x={d => xScale(xAccessor(d))}
          y={d => yScale(yAccessor(d))}
          stroke={'#666666'}
          strokeWidth={0.25}
          className={line}
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
 export {xAccessor, xMaxExtent}
