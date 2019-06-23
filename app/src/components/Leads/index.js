import React, {useEffect, useState} from 'react'

import {leads} from './style'

export default ({ecgLink}) => {
  const [{positive, negative}, setLeads] = useState(ecgLink ? ecgLink.leads : {})

  useEffect(() => {
    const update = ({detail: leads}) => setLeads(leads)


    ecgLink.addEventListener('leads', update)

    return () => ecgLink.removeEventListener('leads', update)
  }, [])

  return (
    <section className={leads}>
      {`${positive ? 'Positive Connected' : 'Positive Disconnected'}`}
      {`${negative ? 'Negative Connected' : 'Negative Disconnected'}`}
      {`${!negative && !positive ? 'Check Ground' : ''}`}
    </section>
  )
}
