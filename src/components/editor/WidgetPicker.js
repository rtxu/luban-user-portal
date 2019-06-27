import React, { useEffect } from 'react';
import { Card } from 'antd';
import myStyles from './WidgetPicker.css';
import DndItemTypes from './DndItemTypes';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from "react-dnd-html5-backend";

const { Meta } = Card;

// TODO(ruitao.xu): adjust font
const widgetGroups = [
  {
    header: '常用',
    widgets: [
      {
        title: '文本',
        description: '显示文本、标注用途等',

        dragItem: {
          type: DndItemTypes.TEXT,
          gridWidth: 3,
          gridHeight: 1,
        },
      },
      {
        title: '表格',
        description: '展示表格数据',

        dragItem: {
          type: DndItemTypes.TABLE,
          gridWidth: 8,
          gridHeight: 8,
        },
      },
      {
        title: '按钮（Button）',
        description: '触发数据库查询、提交数据操作结果等',

        dragItem: {
          type: DndItemTypes.BUTTON,
          gridWidth: 2,
          gridHeight: 1,
        },
      },
    ],
  },
  {
    header: '控制类',
    widgets: [
      {
        title: '文本',
        description: '显示文本、标注用途等',

        dragItem: {
          type: DndItemTypes.TEXT,
        },
      },
      {
        title: '表格',
        description: '展示表格数据',

        dragItem: {
          type: DndItemTypes.TABLE,
        },
      },
      {
        title: '按钮（Button）',
        description: '触发数据库查询、提交数据操作结果等',

        dragItem: {
          type: DndItemTypes.BUTTON,
        },
      },
    ],
  },
  {
    header: '输入类',
    widgets: [
      {
        title: '文本',
        description: '显示文本、标注用途等',

        dragItem: {
          type: DndItemTypes.TEXT,
        },
      },
      {
        title: '表格',
        description: '展示表格数据',

        dragItem: {
          type: DndItemTypes.TABLE,
        },
      },
      {
        title: '按钮（Button）',
        description: '触发数据库查询、提交数据操作结果等',

        dragItem: {
          type: DndItemTypes.BUTTON,
        },
      },
    ],
  },
];

function WidgetCard({title, description, dragItem}) {
  const [{isDragging}, drag, preview] = useDrag({
    item: dragItem,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  useEffect(() => {
    preview(getEmptyImage());
  }, [])
  return (
    <div ref={drag} >
      <Card
        size='small'
        hoverable
        bordered
        className={myStyles.widgetCard}
      >
        <Meta
          title={title}
          description={description}
        />
      </Card>
    </div>
  )
}

function WidgetPicker({}) {
  return (
    <div>
      {
        widgetGroups.map((group, index) => (
          <div key={index}>
            <p className={myStyles.widgetGroupHeader}>{group.header}</p>
            {
              group.widgets.map((widget, index) => {
                return (
                  <WidgetCard {...widget} key={index} />
                )
              })
            }
          </div>
        ))
      }
    </div>
  )
}

export default WidgetPicker;