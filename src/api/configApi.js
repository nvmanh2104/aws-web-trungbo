import { callApi, API } from './authApi';

export const configApi = {
  getAll: (page_size = 10) => callApi(API.CONFIG.getAll(page_size)),
  getById: (id) => callApi(API.CONFIG.getById(id)),
  create: (body) => callApi(API.CONFIG.create(), body),
  update: (id, body) => callApi(API.CONFIG.update(id), body),
  delete: (id) => callApi(API.CONFIG.delete(id)),
};