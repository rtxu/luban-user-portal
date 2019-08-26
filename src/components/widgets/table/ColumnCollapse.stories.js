import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import ColumnCollapse from './ColumnCollapse';
import { ColumnCollapseContainer } from './Table';

export const column = {
  name: 'Test Column#1',
  index: 1, 
  visible: true,
};

export const actions = {
  visibleOnClick: action('visibleOnClick'),
  moveColumn: action('moveColumn'),
};

const DndCollapse = DragDropContext(HTML5Backend)(ColumnCollapseContainer);

storiesOf('ColumnCollapse', module)
  .addDecorator(story => (
    <div style={{ padding: '24px', width: 300, backgroundColor: '#AFDDB6', }}>
      <DndCollapse>{story()}</DndCollapse>
    </div>
  ))
  .add('default', () => <ColumnCollapse {...column} {...actions} />)
  .add('single-invisible', () => <ColumnCollapse {...{ ...column, visible: false, }} {...actions} />)
  .add('multiple', () => (
    <>
      <ColumnCollapse {...{ ...column, name: 'visible', visible: true, }} {...actions} />
      <ColumnCollapse {...{ ...column, name: 'invisible', visible: false, }} {...actions} />
      <ColumnCollapse {...{ ...column, name: '拖我排序试试', visible: true, }} {...actions} />
    </>
  ))