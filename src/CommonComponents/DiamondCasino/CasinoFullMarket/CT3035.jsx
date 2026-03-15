import React, { useState } from 'react'
import CT3035CasinoIframe from '../CasinoIframe/CT3058'

function CT3035({ gameId, data, socketDis }) {
    const [selfSuspend, setSelfSuspend] = useState(false);
    
    return (
        <div className='w-full'>
            <CT3035CasinoIframe gameId={gameId}
                data={data}
                setSelfSuspend={(bool) => setSelfSuspend(bool)} />
        </div>
    )
}

export default CT3035