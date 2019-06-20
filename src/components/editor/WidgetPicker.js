import { Component } from 'react';
import { Card } from 'antd';
import myStyles from './WidgetPicker.css';

const { Meta } = Card;

// TODO(ruitao.xu): adjust font
const widgetGroups = [
  {
    header: '常用',
    widgets: [
      {
        title: '文本',
        description: '显示文本、标注用途等',
      },
      {
        title: '表格',
        description: '展示表格数据',
      },
      {
        title: '按钮（Button）',
        description: '触发数据库查询、提交数据操作结果等',
      },
    ],
  },
  {
    header: '控制类',
    widgets: [
      {
        title: '文本',
        description: '显示文本、标注用途等',
      },
      {
        title: '表格',
        description: '展示表格数据',
      },
      {
        title: '按钮（Button）',
        description: '触发数据库查询、提交数据操作结果等',
      },
    ],
  },
  {
    header: '输入类',
    widgets: [
      {
        title: '文本',
        description: '显示文本、标注用途等',
      },
      {
        title: '表格',
        description: '展示表格数据',
      },
      {
        title: '按钮（Button）',
        description: '触发数据库查询、提交数据操作结果等',
      },
    ],
  },
];

export default class WidgetPicker extends Component {
  render() {
    return (
      <div>
        {
          widgetGroups.map((group, index) => (
            <div key={index}>
              <p className={myStyles.widgetGroupHeader}>{group.header}</p>
              {
                group.widgets.map((widget, index) => {
                  return (
                    <Card 
                      key={index}
                      size='small'
                      hoverable
                      bordered
                      draggable
                      className={myStyles.widgetCard}
                    >
                      <Meta 
                        title={widget.title}
                        description={widget.description}
                      />
                    </Card>
                  )
                })
              }
            </div>
          ))
        }
      </div>
    )
  }
}