import React, { useState } from 'react'
import DeactivatedSprintTable from './deactivated/DeactivatedMilstoneTable'
import ActiveSprintTable from './activeMilstone/ActiveMilstoneTable'
const ActiveDeactiveSprintIndex = () => {
    const [connectActive, setConnectActive] = useState(false)
    const connectMilstone = () => {
        setConnectActive(!connectActive)
    }

    return (
        <div>
            <div className='d-flex mt-2'>
                <div><button className={!connectActive ? 'btn btn-primary active' : "btn"} onClick={() => { connectMilstone() }}>
                    Active
                </button></div>
                <div className='ms-2 '><button className={!connectActive ? 'btn' : "btn btn-primary active"} onClick={() => { connectMilstone() }}>
                    Deactive
                </button></div>
            </div>
            {connectActive ? <div>
                <DeactivatedSprintTable />
            </div> : <div>
                <ActiveSprintTable />
            </div>}


        </div>
    )
}

export default ActiveDeactiveSprintIndex