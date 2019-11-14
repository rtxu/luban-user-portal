/** 模板类型 */
export enum TemplateTypeEnum {
  Default,
  Alasql
}

export type ErrorT =
  | null
  | Error
  | EvalError
  | RangeError
  | ReferenceError
  | SyntaxError
  | TypeError
  | URIError;
export type OnEvalT = (value, valueExtra, error: ErrorT) => void;

export interface ITemplate {
  /** 模板 id，其他模板可以通过该 id 引用该模板的值，e.g: widget1.value, op1.data */
  id: string;
  type: TemplateTypeEnum;
  /** 待渲染的模板字符串 */
  input: string;
  /** 模板渲染完成后的回调 */
  onEval: OnEvalT;
}

export interface IDefaultTemplate extends ITemplate {
  type: TemplateTypeEnum.Default;
}

export interface IAlasqlTemplate extends ITemplate {
  type: TemplateTypeEnum.Alasql;
}

export interface ICtx {
  [key: string]: any;
}
