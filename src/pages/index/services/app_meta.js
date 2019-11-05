
const DB = 'luban.db.app'

function makeJsonResponse(json, status=200, statusText='OK') {
  return new Response(
    new Blob([JSON.stringify(json)], {type: 'application/json'}), 
    {'status': status, 'statusText': statusText}
  );
}

export function add({name, description}) {
  // local storage impl
  return new Promise((resolve, reject) => {
    try {
      const value = localStorage.getItem(DB);
      let appList = null;
      if (value) {
        appList = JSON.parse(value);
        appList.push({name, description});
      } else {
        appList = [{name, description}]
      }
      localStorage.setItem(DB, JSON.stringify(appList));

      resolve(makeJsonResponse({ code: 0, msg: 'ok', }));
    } catch(e) {
      reject(e);
    }
  });
}

export function remove(name) {
  // local storage impl
  return new Promise((resolve, reject) => {
    try {
      const value = localStorage.getItem(DB);
      let appList = null;
      if (value) {
        appList = JSON.parse(value);
      } else {
        appList = []
      }
      appList = appList.filter((app) => app.name != name);
      localStorage.setItem(DB, JSON.stringify(appList));

      resolve(makeJsonResponse({ code: 0, msg: 'ok', }));
    } catch(e) {
      reject(e);
    }
  });
}

export function setAppDescription(name, newDescription) {
  // local storage impl
  return new Promise((resolve, reject) => {
    try {
      const value = localStorage.getItem(DB);
      let appList = null;
      if (value) {
        appList = JSON.parse(value);
      } else {
        appList = []
      }
      appList = appList.map((app) => {
        if (app.name === name) {
          return {
            ...app,
            description: newDescription,
          }
        } else {
          return app;
        }
      });
      localStorage.setItem(DB, JSON.stringify(appList));

      resolve(makeJsonResponse({ code: 0, msg: 'ok', }));
    } catch(e) {
      reject(e);
    }
  });
}

export function loadApps() {
  // local storage impl
  return new Promise((resolve, reject) => {
    try {
      const value = localStorage.getItem(DB);
      let appList = null;
      if (value) {
        appList = JSON.parse(value);
      } else {
        appList = []
      }
      localStorage.setItem(DB, JSON.stringify(appList));

      resolve(makeJsonResponse({ code: 0, msg: 'ok', data: appList, }));
    } catch(e) {
      reject(e);
    }
  });
}