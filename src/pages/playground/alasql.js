import React from 'react';
import alasql from 'alasql';
import JSONTree from 'react-json-tree';


function Playground() {

  alasql(`
  CREATE LOCALSTORAGE DATABASE IF NOT EXISTS todo_db;
  ATTACH LOCALSTORAGE DATABASE todo_db;
  USE todo_db;
  `);
  alasql(`
  CREATE LOCALSTORAGE DATABASE IF NOT EXISTS todo_db;
  ATTACH LOCALSTORAGE DATABASE todo_db;
  USE todo_db;
  `);
  alasql(`
  CREATE LOCALSTORAGE DATABASE IF NOT EXISTS todo_db;
  ATTACH LOCALSTORAGE DATABASE todo_db;
  USE todo_db;
  `);
  alasql('DROP TABLE IF EXISTS todo');
  alasql('DROP TABLE IF EXISTS todo2');
  // alasql('CREATE TABLE IF NOT EXISTS todo (id INT AUTOINCREMENT PRIMARY KEY, text STRING)');
  alasql('CREATE TABLE IF NOT EXISTS todo (id INT PRIMARY KEY, text STRING)');
  alasql('CREATE TABLE IF NOT EXISTS todo2 (id INT PRIMARY KEY, text STRING)');

  alasql('INSERT INTO todo VALUES (?, ?), (?, ?)', [1, 'todo1', 2, 'todo2']);
  
  const res = alasql('SELECT * FROM todo;');
  console.log('SELECT * FROM todo', res);
  console.log('show databases', alasql('show databases;'));
  console.log('show tables', alasql('show tables;'));
  console.log('show columns from todo', alasql('show columns from todo;'));
  // 同步调用不报错！
  console.log('error sql', alasql('error sql;'));
  // 异步调用可以
  alasql.promise('error sql')
    .then((res) => {
      console.log('res', res);
    }).catch((e) => {
      console.log('caught error, name:', e.name);
      console.log('caught error, msg:', e.message);
    })

  //alasql('DELETE FROM todo;');

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