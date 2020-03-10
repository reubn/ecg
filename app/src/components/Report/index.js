import React from 'react'
import {extent} from 'd3-array'
import {format} from 'date-fns'

import {saveAs} from 'file-saver'

import Trace, {xAccessor, xMaxExtent, xScaleFactor, yScaleFactor} from './Trace'

import {report, wrapper, number, unit, header, footer, seperator, bold, print, download} from './style'

const Report = ({recording/*, hz*/}) => {
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
  const startDate = new Date()
  const HH = +format(startDate, 'HH')
  const correctedHours = `${HH > 12 ? HH - 12 : HH}`.padStart(2, 0)

  const ordinalIndicator = format(startDate, 'do').slice(-2)

  const downloadCSV = () => {
    const csvString = 'timestamp(ns),value(mV)\r\n' + recording.map(pair => pair.join(`,`)).join('\r\n')

    const blob = new Blob([csvString], {type : 'text/csv'})

    saveAs(blob, `${startDate.toString()}.ecg.csv`)
  }

  return (
    <section className={report}>
      <span className={download} onClick={downloadCSV}>Export</span>
      <span className={print} onClick={() => window.print()}>Print</span>
      <span className={wrapper}>
        <header className={header}>
          <span>Reuben <b className={bold}>Eggar</b></span>
          <span>Recorded at {correctedHours + format(startDate, ':mm aa — EEEE d')}<sup>{ordinalIndicator}</sup>{format(startDate, ' LLLL yyyy')}</span>
        </header>
        {traces}
        <footer className={footer}>
          <span className={number}>{1000 * 1000 * xScaleFactor}</span><span className={unit}>mm/s</span>
          <span className={seperator}> x </span>
          <span className={number}>{1 / 1000 * yScaleFactor}</span><span className={unit}>mm/mV</span>
          <span className={seperator}> — </span>
          {/*<span className={number}>{hz}</span><span className={unit}>Hz</span>
          <span className={seperator}>; </span>*/}
          <span className={unit}>v</span><span className={number}>{__version__}</span>
          <span className={seperator}> — </span>
          <span>This waveform is indictaive only, and should not be the basis for any form of medical advice</span>
          <span className={seperator}> — </span>
          <span>ecg.reuben.science</span>
        </footer>
      </span>
    </section>
  )
}

export default Report
