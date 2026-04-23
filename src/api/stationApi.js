import { callApi, API } from './authApi';

export const stationApi = {
  getAll: (page_size = 10) =>
    callApi(API.STATIONS.getAll(page_size)),
};