import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ColumnCollapse from './ColumnCollapse';
import { DndCollapse } from './Table';

export const column = {
  name: 'Test Column#1',
  index: 1, 
  visible: true,
};

export const actions = {
  visibleOnClick: action('visibleOnClick'),
  moveColumn: action('moveColumn'),
};

storiesOf('ColumnCollapse', module)
  .addDecorator(story => (
    <div style={{ padding: '24px', width: 300, backgroundColor: '#AFDDB6', }}>
      <DndCollapse>{story()}</DndCollapse>
    </div>
  ))
  .add('default', () => <ColumnCollapse {...column} {...actions} />)