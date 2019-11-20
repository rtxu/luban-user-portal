export const getLayoutStyle = ({
  gridTop,
  gridLeft,
  gridHeight,
  gridWidth,
  unitHeight,
  unitWidth
}) => {
  // console.log(gridTop, gridLeft, gridHeight, gridWidth, unitHeight, unitWidth);
  const top = gridTop * unitHeight;
  const left = gridLeft * unitWidth;
  const style = {
    /*
    // try to optimize performance, use transform instead of top/left, no obvious effect
    top: gridTop * CANVAS.rowHeight,
    left: gridLeft * canvasColumnWidth,
    */
    transform: `translate(${left}px, ${top}px)`,
    height: gridHeight * unitHeight,
    width: gridWidth * unitWidth
  };
  return style;
};
