import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import MarketingTeamDashboard from './MarketingDashboard/MarketingTeamDashboard'
import AdminTaskDashboard from './TaskDashboard/index'
import QaDashboard from './QaDashboard/QaDashboard'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useSearchParams } from 'react-router-dom'

const TaskDashboard = () => {
    const store = useSelector((state) => state || {});
    const [searchParams] = useSearchParams();
    const qaId = searchParams.get('qaId');
    return (
        <ErrorBoundary>
            {store?.Auth?.user?.role === 'Marketing' ?
                <MarketingTeamDashboard />
                :
                store?.Auth?.user?.role === 'QA' ?
                    <QaDashboard />
                    :
                    store?.Auth?.user?.role === 'admin' && qaId ?
                        <QaDashboard />
                        :
                        store?.Auth?.user?.role === 'admin' || store?.Auth?.user?.role === 'Sales' ?
                            <AdminTaskDashboard />
                            :
                            <AdminTaskDashboard />
            }
        </ErrorBoundary>
    )
}

export default TaskDashboard