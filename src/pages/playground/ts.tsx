import React from 'react';

/** here is a ts function, just print `name` */
export function hello(name: string) {
  console.log(name);
}

export default function () {
  return (
    <div style={{height: 400, width: 400, backgroundColor: 'yellow'}}>This is a ts component</div>
  );
}