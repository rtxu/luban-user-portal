import { IWidgetMap } from "@/models/widgets";
import { IOperationMap } from "@/models/operations";

export interface AppMeta {
  fullName: string; // fullpath, eg: /a/b/c
  dirName: string; // when appFullName=/a/b/c, appDirName=/a/b
  name: string; // when appFullName=/a/b/c, appName=c
  id: number;
}

export const EmptyAppMeta: AppMeta = {
  fullName: "",
  dirName: "",
  name: "",
  id: -1
};

export interface AppState {
  widgets: IWidgetMap;
  operations: IOperationMap;
}

export interface AppAction {
  widgetDispatch: (widgetId: string, widgetAction: any) => void;
  execOperation: (opId: string) => void;
}

const NotImplementedFn = () => {
  throw new Error("Not Implemented");
};
export const EmptyAppAction: AppAction = {
  widgetDispatch: NotImplementedFn,
  execOperation: NotImplementedFn
};
