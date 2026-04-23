import { callApi, API } from './authApi';

export const stationGroupApi = {
  getAll: (params = {}) => callApi(API.STATION_GROUPS.getAll(params.page_size || 1000)),
  getByCode: (code) => callApi(API.STATION_GROUPS.getByCode(code)),
  create: (body) => callApi(API.STATION_GROUPS.create(), body),
  update: (code, body) => callApi(API.STATION_GROUPS.update(code), body),
  delete: (code) => callApi(API.STATION_GROUPS.delete(code)),
};