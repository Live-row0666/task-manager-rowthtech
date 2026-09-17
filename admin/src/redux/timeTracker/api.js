import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function getTimeTrackerApi(): any {
    return api.get(URL.getTimeTracker)
}

export function getUserRecordApi(data): any {
    const params = new URLSearchParams();

    if (data.payload.userId) {
        params.append('userId', data.payload.userId);
    }

    if (data.payload.startDate) {
        params.append('startDate', data.payload.startDate);
    }

    if (data.payload.endDate) {
        params.append('endDate', data.payload.endDate);
    }
    if (data.payload.projectType) {
        params.append('projectType', data.payload.projectType);
    }

    const queryString = params.toString();
    const url = `${URL.getUserRecordEndpoint}${queryString ? `?${queryString}` : ''}`;

    return api.get(url);
}
