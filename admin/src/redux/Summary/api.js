import * as URL from '../../constants/endpoint';
import { APICore } from '../../helpers/api/apiCore';
const api = new APICore();

export function GetTaskSummaryApi(params: any): any {
    const { data } = params;
    return api.get(URL.TaskSummaryDetail, data?.payload);
}
export function GetPriorityGraphApi(data): any {
    return api.get(URL.PriorityGraph, data.payload);
}
export function GetTaskWeekCountApi(data): any {
    return api.get(URL.TaskWeekCount, data.payload);
}

export function getAllTaskCountsApi(data): any {
    return api.get(URL.getAllTaskCount, data.payload);
}