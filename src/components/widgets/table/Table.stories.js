import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, object, array } from '@storybook/addon-knobs/react';
import produce from 'immer';

import Table, { genColumnsByFirstRow } from './Table';

const data = [
  {
    name: '漩涡鸣人',
    age: 32,
    address: '木叶村',
  },
  {
    name: '自来也',
    age: 52,
    address: '这是一段很长的文本，需要长到足以让该 column 显示出...。妙木山的蛤蟆仙人助小自来也一臂之力。妙木山的蛤蟆仙人助小自来也一臂之力。妙木山的蛤蟆仙人助小自来也一臂之力。',
  },
]

const moreThanOnePageData = produce(data, draft => {
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
  draft.push(data[0])
})

const columns = genColumnsByFirstRow(data[0]);

export const props = {
  data: data,
  columns: columns,
}

export const actions = {
  dispatch: action('dispatch'),
};

storiesOf('Table', module)
  .addDecorator(withKnobs)
  .add('default', () => (
    <Table 
      data={object('data', props.data)}
      columns={object('columns', props.columns)}
      {...actions} />
  ))
  .add('no data', () => <Table data={[]} columns={[]} {...actions} />)
  .add('hide a column', () => {
    const newProps = produce(props, draft => {
      draft.columns[1].meta.visible = false;
    })
    return ( <Table {...newProps} {...actions} /> )
  })
  .add('compact mode', () => {
    return (
      <>
        <p>Normal</p>
        <Table {...props} {...actions} /> 
        <p>Compact</p>
        <Table {...props} isCompact={true} {...actions} /> 
        <p>Compact, more than one page</p>
        <Table {...props} isCompact={true} data={moreThanOnePageData} {...actions} /> 
      </>
    )
  })
  .add('adaptive pageSize', () => {
    return ( 
      <>
        <p><em style={{color: 'red'}}>[INVALID, NOT EXIST in editor]</em> too small height, less than (header + pagination)</p>
        <Table {...props} height={82} {...actions} /> 
        <p><em style={{color: 'red'}}>[INVALID, NOT EXIST in editor]</em> height=(21+2*12+1)+(24+2*16)=45+56=102, equal to (header + pagination)</p>
        <Table {...props} height={102} {...actions} /> 
        <p>height=122, greater than (header + pagination)</p>
        <Table {...props} height={122} {...actions} /> 
        <p>height=300</p>
        <Table {...props} height={300} {...actions} /> 
        <p>height=300, more than one page</p>
        <Table {...props} height={300} data={moreThanOnePageData} {...actions} /> 
        <p>height=400</p>
        <Table {...props} height={400} {...actions} /> 
        <p>height=400, more than one page</p>
        <Table {...props} height={400} data={moreThanOnePageData} {...actions} /> 
        <p>height=500</p>
        <Table {...props} height={500} {...actions} /> 
        <p>height=500, more than one page</p>
        <Table {...props} height={500} data={moreThanOnePageData} {...actions} /> 
      </>
    )
  })
  .add('different column width', () => {
    const props_width_100_200_300 = produce(props, draft => {
      draft.columns.map((col, index) => {
        draft.columns[index].config.width = (index + 1) * 100;
      })
    })
    const props_width_none_200_300 = produce(props_width_100_200_300, draft => {
      delete draft.columns[0].config.width;
    })

    return ( 
      <>
        <p>default: no specific width</p>
        <Table {...props} {...actions} /> 
        <p>width=[100, 200, 300]</p>
        <Table {...props_width_100_200_300} {...actions} /> 
        <p>width=[none, 200, 300]</p>
        <Table {...props_width_none_200_300} {...actions} /> 
      </>
    )
  })