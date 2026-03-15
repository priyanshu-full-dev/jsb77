import React from 'react'
import CT1CasinoIframe from '../CasinoIframe/CT1'

function CT1({gameId}) {
  return (
    <div className='w-full'>
      <CT1CasinoIframe gameId={gameId} />
    </div>
  )
}

export default CT1