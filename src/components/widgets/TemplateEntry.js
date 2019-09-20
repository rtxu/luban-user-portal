import PropTypes from 'prop-types';

export const TemplateEntryState = {
  PENDING: Symbol(),
  EVALUATED: Symbol(),
  ERROR: Symbol(),
}

const _ = {}

_.propTypes = {
  // raw value
  template: PropTypes.string.isRequired,

  // derived value
  value: PropTypes.string,
  state: PropTypes.oneOf([
    TemplateEntryState.PENDING,
    TemplateEntryState.EVALUATED,
    TemplateEntryState.ERROR,
  ]),
  error: PropTypes.oneOfType([
    PropTypes.instanceOf(Error),
    PropTypes.instanceOf(EvalError),
    //PropTypes.instanceOf(InternalError),
    PropTypes.instanceOf(RangeError),
    PropTypes.instanceOf(ReferenceError),
    PropTypes.instanceOf(SyntaxError),
    PropTypes.instanceOf(TypeError),
    PropTypes.instanceOf(URIError),
  ]),

};

const toEvalResult = (templateEntry) => {
  switch (templateEntry.state) {
    case TemplateEntryState.PENDING:
      return {
        code: 0,
        msg: '正在求值，请等待...',
      }
    case TemplateEntryState.EVALUATED:
      return {
        code: 0,
        msg: `= ${templateEntry.value}`,
      }
    case TemplateEntryState.ERROR:
      return {
        code: -1,
        msg: `${templateEntry.error.name}: ${templateEntry.error.message}`,
      }
    default:
      return {
        code: -1,
        msg: `unknown template state: ${templateEntry.state}`,
      }
  }
}

_.toEvalResult = toEvalResult;

export default _;