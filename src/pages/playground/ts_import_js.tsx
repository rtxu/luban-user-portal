import React from 'react';
import JsComponent from './js';

export default function () {
  return (
    <div>
      <h1> This is a <span style={{backgroundColor: 'yellow'}}>ts_import_js</span> component. </h1>
      <h2> The following is a <span style={{backgroundColor: 'blue'}}>js</span> component. </h2>
      <JsComponent/>
    </div>
  )
}