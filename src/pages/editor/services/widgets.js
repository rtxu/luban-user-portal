import request from "@/util/request";

export function loadWidgets(userId, appId) {
  return request(`/api/users/${userId}/apps/${appId}/widgets`);
}

export function saveWidgets(userId, appId, widgets) {
  return request(`/api/users/${userId}/apps/${appId}/widgets`, {
    headers: {
      "content-type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(widgets)
  });
}
