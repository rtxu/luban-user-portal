import PropTypes from 'prop-types';

export const Type = {
  TEXT: 'text',
  BUTTON: 'button',
  TABLE: 'table',
  TEXTINPUT: 'text_input',
}

/*
function create(type) {
  switch (type) {
    case Type.TEXT:
      return 

  }
}
*/

function Widget({type}) {
  // const widget = create(type);
  return {widget};
}

Widget.propTypes = {
  type: PropTypes.string.isRequired,
}

Widget.Type = Type;

export default Widget;