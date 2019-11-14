import { createMockHandler } from "@/util";

// widgets mem store
const store = {};

function getWidgets(userId, appId) {
  if (userId in store && appId in store[userId]) {
    return store[userId][appId];
  }
  // TODO(ruitao.xu): when error happens
  return {};
}

function saveWidgets(userId, appId, widgets) {
  if (!(userId in store)) {
    store[userId] = {};
  }

  if (!(appId in store[userId])) {
    store[userId][appId] = {};
  }

  store[userId][appId] = widgets;

  // TODO(ruitao.xu): when error happens
}

// req 和 res 的文档：https://expressjs.com/en/4x/api.html#req
export default {
  "GET /api/users/:userId/apps/:appId/widgets": createMockHandler(
    (req, res) => {
      const userId = req.params.userId;
      const appId = req.params.appId;
      const widgets = getWidgets(userId, appId);
      console.log(`typeof(widgets)`, typeof widgets);
      console.log(`widgets`, widgets);
      res.json(widgets);
    }
  ),
  "POST /api/users/:userId/apps/:appId/widgets": createMockHandler(
    (req, res) => {
      const userId = req.params.userId;
      const appId = req.params.appId;
      const widgets = req.body;
      console.log(widgets);
      saveWidgets(userId, appId, widgets);
      res.status(200).json({});
    }
  )
};
