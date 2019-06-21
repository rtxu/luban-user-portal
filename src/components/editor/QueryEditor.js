import { Component } from 'react';
import { 
  Select, 
  Tabs, 
  Icon, 
  Button, 
  Input,
} from 'antd';
import myStyles from './QueryEditor.less';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

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
      <div className={myStyles.queryEditor}>
        <div className={myStyles.qeNaviBar}>
          <div className={myStyles.tabContainer}>
            <div className={myStyles.override}>
              <Tabs 
                defaultActiveKey="1" 
                type='card'>
                {[...Array(2).keys()].map((i) => (
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
        <div className={myStyles.qeHeader}>
          <div className={myStyles.left}>
            <label>数据源：
              <Select defaultValue="lucy" style={{ width: 300 }} >
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>
                  Disabled
                </Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </label>
          </div>
          <div className={myStyles.right}>
              <Button type='danger'>删除</Button>
              <Button>格式化</Button>
              <Button>复制</Button>
              <Button disabled>保存</Button>
              <Button type='primary'>预览</Button>
          </div>
        </div>
        <div className={myStyles.qeBody}>
          <section>
            {/* TODO(ruitao.xu): embed a code editor */}
            <TextArea rows={4} />
            <hr/>
          </section>
          <section>
            <h5>执行完成后</h5>
            <div>
              <div className={myStyles.left}>
                <p>如果成功，执行如下操作</p>
              </div>
              <div className={myStyles.right}>
                <p>如果失败，执行如下操作</p>
              </div>
            </div>
            <hr/>
          </section>
          <section>
            <h5>时间配置</h5>
            <hr/>
          </section>
          <section>
            <h5>高级选项</h5>
            <hr/>
          </section>
        </div>
      </div>
    )
  }
}