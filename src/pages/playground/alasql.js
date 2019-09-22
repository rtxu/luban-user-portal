import React from 'react';
import alasql from 'alasql';
import JSONTree from 'react-json-tree';

function Playground() {
  const data = [{a:1,b:1,c:1},{a:1,b:2,c:1},{a:1,b:3,c:1}, {a:2,b:1,c:1}];
  const res = alasql('SELECT a, COUNT(*) AS b FROM ? GROUP BY a',[data]);
  console.log(res);

  return (
    <div>
      <JSONTree data={res} 
        theme={{
          extend: 'default',
          tree: {
            backgroundColor: '#fff',
          },
        }}
        hideRoot={true} 
      />
    </div>
  )
}

export default Playground;