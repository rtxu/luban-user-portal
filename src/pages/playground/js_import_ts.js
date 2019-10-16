import React from 'react';
import TsComponent, { hello } from './ts';

export default function () {
  hello("js could call ts function");
  return (
    <div>
      <h1> This is a <span style={{backgroundColor: 'blue'}}>js_import_ts</span> component. </h1>
      <h2> The following is a <span style={{backgroundColor: 'yellow'}}>ts</span> component. </h2>
      <TsComponent/>
    </div>
  )
}