import request from '@/util/request.js';

/*
export function queryList() {
  return request('/api/cards');
}

export function deleteOne(id) {
  return request(`/api/cards/${id}`, {
    method: 'DELETE'
  });
}

export function addOne(data) {
  return request('/api/cards/add', {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getStatistic(id) {
  return request(`/api/cards/${id}/statistic`);
}
*/

export function loadWidgets(userId, appId) {
  return request(`/api/users/${userId}/apps/${appId}/widgets`);
}

export function saveWidgets(userId, appId, widgets) {
  console.log(`saveWidgets(${userId}, ${appId}, ${JSON.stringify(widgets)})`)
  return request(`/api/users/${userId}/apps/${appId}/widgets`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(widgets),
  });
}