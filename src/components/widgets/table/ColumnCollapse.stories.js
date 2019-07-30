import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ColumnCollapse from './ColumnCollapse';

export const column = {
  name: 'Test Column#1'
};

export const actions = {
};

storiesOf('ColumnCollapse', module)
  .add('default', () => <ColumnCollapse task={task} {...actions} />)