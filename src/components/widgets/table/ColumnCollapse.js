import React, { useRef } from 'react'
import { Icon } from 'antd'
import PropTypes from 'prop-types'
import { useDrag, useDrop } from 'react-dnd'
import throttle from 'lodash.throttle';

import styles from './ColumnCollapse.less'

const handleHoverThrottled = throttle((ref, index, item, monitor, moveColumn) => {
  if (!ref.current) {
    return
  }
  const dragIndex = item.index
  const hoverIndex = index
  // Don't replace items with themselves
  if (dragIndex === hoverIndex) {
    return
  }
  // Determine rectangle on screen
  const hoverBoundingRect = ref.current.getBoundingClientRect()
  // Get vertical middle
  const hoverMiddleY =
    (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
  // Determine mouse position
  const clientOffset = monitor.getClientOffset()
  // Get pixels to the top
  const hoverClientY = clientOffset.y - hoverBoundingRect.top
  // Only perform the move when the mouse has crossed half of the items height
  // When dragging downwards, only move when the cursor is below 50%
  // When dragging upwards, only move when the cursor is above 50%
  // Dragging downwards
  if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
    return
  }
  // Dragging upwards
  if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
    return
  }
  // Time to actually perform the action
  moveColumn(dragIndex, hoverIndex)
  // Note: we're mutating the monitor item here!
  // Generally it's better to avoid mutations,
  // but it's good here for the sake of performance
  // to avoid expensive index searches.
  item.index = hoverIndex
}, 16)

function ColumnCollapse({ name, index, visible, visibleOnClick, moveColumn }) {
  const dndType = 'table-column'
  const ref = useRef(null)
  const [, drop] = useDrop({
    accept: dndType,
    hover(item, monitor) {
      handleHoverThrottled(ref, index, item, monitor, moveColumn);
    },
  })
  const [{ isDragging }, drag] = useDrag({
    item: { type: dndType, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))
  
  const visibleIcon = visible ? 'eye' : 'eye-invisible';
  return (
    <div ref={ref} style={{opacity: opacity}} className={ styles.columnCollapse } >
      <div className={ styles.header} >
        <p className={ styles.headerLeftTitle } >
          <Icon type='bars' />
          {name}
        </p>
        <p className={ styles.headerRightIcons } >
          <Icon type={visibleIcon} onClick={(event) => visibleOnClick(index, event)} />
          <Icon type='right' />
        </p>
      </div>
    </div>
  )
}

ColumnCollapse.propTypes = {
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired, 
  visible: PropTypes.bool.isRequired,
  visibleOnClick: PropTypes.func.isRequired,
  moveColumn: PropTypes.func.isRequired,
}

export default ColumnCollapse
