import { ErrorT, ITemplate, TemplateTypeEnum } from '../../util/template';
import { IEvalResult } from '../CmEvalInput';

interface IRestPayload {
    [id: string]: any;
}

interface IOnEvalAction {
  type: string;
  payload: {
    value: any;
    extra: any;
    error: ErrorT;
    [id: string]: any;
  };
}

type IToEvalTemplateBase = Pick<ITemplate, 'id' | 'input' | 'type'>;

interface IToEvalTemplate extends IToEvalTemplateBase {
  onEvalActionCreator: (value: any, extra: any, error: ErrorT) => IOnEvalAction;
}

export function createDefaultToEvalTemplate(id: string, input: string, actionType: string, restPayload?: IRestPayload) {
  const tmpl: IToEvalTemplate = {
    id,
    type: TemplateTypeEnum.Default,
    input,
    onEvalActionCreator: (value: any, extra: any, error: ErrorT) => {
      return {
        type: actionType,
        payload: { value, extra, error, ...restPayload},
      }
    },
  }
  return tmpl;
}

export interface IEvaluatedTemplate {
  input: string;
  value: any;
  error: string;
}

export function toEvalResult(tmpl: IEvaluatedTemplate): IEvalResult {
  if (tmpl.error) {
    return { code: 1, msg: tmpl.error, }
  } else {
    return { code: 0, msg: `= ${tmpl.value}`, }
  }
}