import React from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/display/placeholder';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neo.css';

import './codemirror2.less';
import Config from '../../components/widgets/Config';
import CmInput from '../../components/widgets/CmInput';
import requireContext from 'require-context.macro';

function CodeMirrorPlayGround({}) {
  return (
    <>
    <CodeMirror
      //value="[{'k1':'v1', 'k2':'v2'}, {'k1':'v1', 'k2':'v2'}]"
      options={{
        mode: 'javascript',
        theme: 'neo',
        lineNumbers: false,
        viewportMargin: Infinity,
        placeholder: '测试一下 placeholder 是否起作用',
      }}
      onChange={(editor, data, value) => {
        console.log('typeof(editor): ', typeof(editor));
        console.log('editor: ', editor);
        console.log('typeof(data): ', typeof(data));
        console.log('data: ', data);
        console.log('typeof(value): ', typeof(value));
        console.log('value: ', value);
      }}
    />

    <CmInput 
      value={ JSON.stringify([{'k1': 'v1', 'k2': 'v2'}, {'k1': 'v1', 'k2': 'v2'}], null, 2) }
    />
    <Config.LabelInput 
      label={{ value: 'test'}}
      input={{ 
        value: JSON.stringify([{'k1': 'v1', 'k2': 'v2'}, {'k1': 'v1', 'k2': 'v2'}], null, 2),
      }}
    /> 
    </>
  )
}

export default CodeMirrorPlayGround;