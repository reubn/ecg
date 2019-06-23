import React, {useEffect, useState} from 'react'

import {bpm} from './style'

export default ({ecgLink}) => {
  const [bpm, setBPM] = useState(ecgLink ? ecgLink.bpm : 0)

  useEffect(() => {
    const update = ({detail: bpm}) => setBPM(bpm)


    ecgLink.addEventListener('beat', update)

    return () => ecgLink.removeEventListener('beat', update)
  }, [])

  return (
    <section className={bpm}>
      {bpm}
    </section>
  )
}
