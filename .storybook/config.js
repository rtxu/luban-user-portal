import { configure } from '@storybook/react';
import requireContext from 'require-context.macro';
import 'antd/dist/antd.css';

// automatically import all files ending in *.stories.js
const req = requireContext('../src', true, /\.stories\.js$/);
function loadStories() {
  req.keys().forEach(filename => {
    // console.log(filename);
    return req(filename)
  });
}

configure(loadStories, module);