import { Component } from 'react';
import styles from './EditorCanvas.less';

// TODO(ruitao.xu): gridDots 不能随浏览器窗口缩放而调整
class GridDots extends Component {
  render() {
    /*
    const grid = document.getElementById('grid');
    const width = grid.clientWidth;
    */
    
    const width = 800;
    const height = 560;
    const columnCnt = 13;
    const columnWidth = 2;

    const widthUnit = (width - columnCnt * columnWidth) / 12;
    let myStyles = [];
    for (let i = 0; i < columnCnt; i++) {
      const style = {
        height: height,
        // minus one to center the dot
        transform: `translate3d(${i * widthUnit - 1}px, 0px, 0px)`,
      }
      myStyles.push(style);
    }
    return (
      <div class={styles.gridDots}>
        {[...Array(13).keys()].map((i) => (
          <div class={styles.column} style={myStyles[i]}></div>
        ))}
      </div>
    )
  }
}

export default class EditorCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: true,
    }
  }

  render() {
    const { dragging } = this.state;
    const gridClassArray = [styles.grid]
    if (dragging) {
      gridClassArray.push(styles.lift);
    }
    const gridClassName = gridClassArray.join(' ');

    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div id='grid' className={gridClassName}>
            { dragging && <GridDots /> }
          </div>
        </div>
      </div>
    )
  }
}