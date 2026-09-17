import { useDispatch } from 'react-redux';
import axios from "axios";
import ToastHandle from "../constants/toaster/toaster";
import { getsingleSprintTask } from "../redux/actions";

export const startTimerApi = async (taskId, projectId) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/time-tracking-logs/start`, {
            taskId: taskId,
            projectId: projectId,
        })
        if (response.data.status === 201) {
            ToastHandle(response.data.message, 'success');
        }
    } catch (error) {
        console.log(error, 'ERROR IN STARTING TIMER')
    }
}

