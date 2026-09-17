import React, { useState } from 'react'
import DeactivatedMilstoneTable from './deactivated/DeactivatedMilstoneTable'
import ActiveMilstoneTable from './activeMilstone/ActiveMilstoneTable'
const ActiveDeactiveIndex = ({ milstonesPrnt }) => {
    const [connectActive, setConnectActive] = useState(false)
    const connectMilstone = (id) => {
        setConnectActive(!connectActive)
        milstonesPrnt(id)
    }

    return (
        <div>
            <div className='d-flex my-2'>
                <div><button className={!connectActive ? 'btn btn-primary active' : "btn"} onClick={() => { connectMilstone(1) }}>
                    Active
                </button></div>
                <div className='ms-2 '><button className={!connectActive ? 'btn' : "btn btn-primary active"} onClick={() => { connectMilstone(0) }}>
                    Deactive
                </button></div>
            </div>
        </div>
    )
}

export default ActiveDeactiveIndex
