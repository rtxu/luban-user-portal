import useSWR from "swr";

import { SWRKey, lubanApiRequest } from "./common";

export enum EntryType {
  App = "app",
  Directory = "directory"
}

interface EntryBase {
  name: string;
  type: EntryType;
  comment?: string;
  icon?: string;
}

export interface AppEntry extends EntryBase {
  appId: number;
}

export interface DirEntry extends EntryBase {
  children: Entry[];
}

export type Entry = AppEntry | DirEntry;

export function isApp(entry: Entry): entry is AppEntry {
  return entry.type === EntryType.App;
}
export function isDir(entry: Entry): entry is DirEntry {
  return entry.type === EntryType.Directory;
}

export function findDir(currentDir: string, root: Entry[]): Entry[] | null {
  if (currentDir === "/") {
    return root;
  } else {
    const fields = currentDir.split("/");
    const subDir = fields[1];
    const leftDir = ["", ...fields.slice(2)].join("/");
    for (const entry of root) {
      if (isDir(entry) && entry.name === subDir) {
        if (leftDir) {
          return findDir(leftDir, entry.children);
        } else {
          return entry.children;
        }
      }
    }
    // not found
    return null;
  }
}

export function findApp(app: string, root: Entry[]): AppEntry | null {
  const fields = app.split("/");
  const dirFields = fields.slice(0, fields.length - 1);
  const dir = dirFields.join("/") || "/";
  const appName = fields[fields.length - 1];
  const dirEntryList = findDir(dir, root);
  if (dirEntryList) {
    for (const entry of dirEntryList) {
      if (isApp(entry) && entry.name === appName) {
        return entry;
      }
    }
  }
  return null;
}

export interface CurrentUserData {
  username: string;
  avatarUrl: string;
  rootDir: Entry[];
}

export const currentUserInitialValue: Readonly<CurrentUserData> = {
  username: "",
  avatarUrl: "",
  rootDir: []
};

function useSWRCurrentUser() {
  return useSWR<CurrentUserData>(SWRKey.CURRENT_USER, lubanApiRequest, {
    // 0.1.17 版本的 bug：https://github.com/zeit/swr/issues/271
    // fix 后可去除此配置
    dedupingInterval: 0
  });
}

export default useSWRCurrentUser;
