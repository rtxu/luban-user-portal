import React from 'react';
import TsComponent from './ts';

export default function () {
  return (
    <div>
      <h1> This is a <span style={{backgroundColor: 'yellow'}}>ts_import_ts</span> component. </h1>
      <h2> The following is a <span style={{backgroundColor: 'yellow'}}>ts</span> component. </h2>
      <TsComponent/>
    </div>
  )
}