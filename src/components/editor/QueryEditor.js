import { Component } from 'react';
import { Tabs, Icon, Button, Input } from 'antd';
import myStyles from './QueryEditor.less';

const { TabPane } = Tabs;

const tabs = [
  {
    name: 'Tab#1_tooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo_Long',
  },
  {
    name: 'Tab#2',
  },
];

export default class QueryEditor extends Component {
  render() {
    return (
      <div>
        <div className={myStyles.qeNaviBar}>
          <div className={myStyles.tabContainer}>
            <div className={myStyles.override}>
              <Tabs 
                defaultActiveKey="1" 
                type='card'>
                {[...Array(30).keys()].map((i) => (
                  <TabPane 
                    style={{ minWidth:'60px', maxWidth:'200px'}}
                    tab={`Tab-${i}_toooooooooooooooooooooooooooooooooooooLong`} 
                    key={i}>
                  </TabPane>
                ))}
              </Tabs>
            </div>
          </div>
          <div className={myStyles.actions}>
              <Button><Icon type="plus" />新建</Button>
              <Input placeholder="快速打开" />
          </div>
        </div>
        <div className={myStyles.qeHeader}></div>
        <div className={myStyles.qeBody}></div>
      </div>
    )
  }
}