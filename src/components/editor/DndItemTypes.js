
const _ = {
  // widget
  TEXT: 'text',
  TABLE: 'table',
  BUTTON: 'button',

  // resize handle
  RH_LEFT_TOP: 'resize.left_top',
  RH_RIGHT_TOP: 'resize.right_top',
  RH_RIGHT_BOTTOM: 'resize.right_bottom',
  RH_LEFT_BOTTOM: 'resize.left_bottom',
}

export const isResizeHandle = (type) => {
  switch(type) {
    case _.RH_LEFT_TOP:
    case _.RH_RIGHT_TOP:
    case _.RH_RIGHT_BOTTOM:
    case _.RH_LEFT_BOTTOM:
      return true;
  }
  return false;
}

export default _;