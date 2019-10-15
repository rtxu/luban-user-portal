/**
 * # 定义
 * 模板，顾名思义，value=<user_input>，可以通过对 <user_input> 的渲染求得 value
 * 模板可以引用页面内的数据，甚至可以执行 js 代码
 * 
 * # 引用的数据来自哪里？
 * 模板引用的数据主要有: 
 * 1. 页面内组件(widget)和操作(operation) exported 的数据
 * exported 数据按照依赖情况来分，分为如下几类：
 * - [无需渲染] raw exported field: 其本身有值，不依赖任何其他 widget/operation
 * - [需要渲染] derived exported field: 
 *   1. 依赖其他 widget/operation 的 exported field
 *   2. operation 类的模板往往需要执行（即渲染）后，方可获得数据
 * 2. app-level 数据
 * 3. user-level 数据
 * 
 * # 由数据引用引入的依赖关系
 * 在模板渲染的过程中，需要按照拓扑序执行，且可能存在循环依赖
 * 
 * # 模板类型
 * 目前有两类模板：
 * 1. default
 * <user_input> 既可以是对其他组件数据的引用，也可以像 js 的模板字符串一样，由普通文本和对其他组件数据的引用共同组成。
 * 
 * 返回值类型：
 *  - 引用值的数据类型：如果整个模板输入仅包含一个引用且无任何其他字符（开头和结尾的空白字符不算），此时该模板的返回值类型等于所引用值的类型。
 *    举例：「{{widget1.value}}」，此时 widget1.value 的类型是什么，返回值的类型就是什么
 *  - 字符串：其他情况
 *    举例：「hello {{textinput1.value}}」，此时 hello 是普通字符串，最终的返回值就是普通字符串
 * 
 * 2. alasql
 * 
 * 
 */

import { ICtx, ITemplate } from './common';
import EvalTopologyGraph from './EvalTopologyGraph_v2';

export { TemplateTypeEnum, ErrorT, ITemplate } from './common';

export function evaluate(templates: ITemplate[], ctx: ICtx) {
  const graph = new EvalTopologyGraph(templates);
  return graph.evaluate(ctx);
}