import {
  IAlasqlTemplate,
  IDefaultTemplate,
  ITemplate,
  TemplateTypeEnum
} from "./common";
import AlasqlOp from "./TemplateOpAlasql";
import DefaultOp from "./TemplateOpDefault";

/** 不管是什么类型的模板，对外提供统一接口，抽象掉由模板类型引入的差异 */
export default {
  buildEvalNodes: (template: ITemplate) => {
    switch (template.type) {
      case TemplateTypeEnum.Default:
        return DefaultOp.buildEvalNodes(template as IDefaultTemplate);
      case TemplateTypeEnum.Alasql:
        return AlasqlOp.buildEvalNodes(template as IAlasqlTemplate);
      default:
        throw new Error(`unexpected template type: ${template.type}`);
    }
  }
};
