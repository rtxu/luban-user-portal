import {
  findDir,
  findApp,
  findDefaultApp,
  Entry,
  EntryType,
  AppEntry,
  getAppFullNameById
} from "./useSWRCurrentUser";

let rootDir: Entry[], dir1: Entry[], dir2: Entry[];
let app1: AppEntry, app2: AppEntry, app3: AppEntry;

/**
/
/entry1
/dir1
/dir1/dir1_entry1
/dir1/dir2
/dir1/dir2/dir1_dir2_entry1
 */
beforeAll(() => {
  app1 = { name: "entry1", type: EntryType.App, appId: 10000 };
  app2 = { name: "dir1_entry1", type: EntryType.App, appId: 10001 };
  app3 = { name: "dir1_dir2_entry1", type: EntryType.App, appId: 10002 };

  dir2 = [app3];
  dir1 = [
    app2,
    {
      name: "dir2",
      type: EntryType.Directory,
      children: dir2
    }
  ];
  rootDir = [
    {
      name: "empty_dir",
      type: EntryType.Directory,
      children: []
    },
    app1,
    {
      name: "dir1",
      type: EntryType.Directory,
      children: dir1
    }
  ];
});

test("findDir", () => {
  expect(findDir("/", rootDir)).toBe(rootDir);
  expect(findDir("/dir1", rootDir)).toBe(dir1);
  expect(findDir("/dir1/", rootDir)).toBe(dir1);
  expect(findDir("/dir1/dir2", rootDir)).toBe(dir2);
  expect(findDir("/dir1/dir2/", rootDir)).toBe(dir2);
  expect(findDir("/entry1", rootDir)).toBeNull();
  expect(findDir("/not_exist_dir", rootDir)).toBeNull();
});

test("findApp", () => {
  expect(findApp("/entry1", rootDir)).toBe(app1);
  expect(findApp("/entry1/", rootDir)).toBe(null);
  expect(findApp("/dir1/dir1_entry1", rootDir)).toBe(app2);
  expect(findApp("/dir1/dir2/dir1_dir2_entry1", rootDir)).toBe(app3);
  expect(findApp("/dir1", rootDir)).toBeNull();
  expect(findApp("/not_exist_app", rootDir)).toBeNull();
});

test("findDefaultApp", () => {
  expect(findDefaultApp(rootDir)).toBe(app1);
  expect(findDefaultApp(dir1)).toBe(app2);
  expect(findDefaultApp(dir2)).toBe(app3);
  expect(findDefaultApp([])).toBe(null);
});

test("getAppFullNameById", () => {
  expect(getAppFullNameById(10000, rootDir)).toBe("/entry1");
  expect(getAppFullNameById(10001, rootDir)).toBe("/dir1/dir1_entry1");
  expect(getAppFullNameById(10002, rootDir)).toBe(
    "/dir1/dir2/dir1_dir2_entry1"
  );
  expect(getAppFullNameById(9999, rootDir)).toBeNull();
});
