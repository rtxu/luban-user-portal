import { Component } from 'react';
import {
  Button
} from 'antd';
import styles from './EditorCanvas.less';

const canvasId = 'canvas';

class Grid extends Component {
  render() {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      return null;
    }
    const columnCnt = 13;
    const dotWidth = 2;
    const columnHeight = 40;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight + 2 * columnHeight;

    const offsetUnit = width / (columnCnt - 1);
    const offsetToCenter = dotWidth / 2;
    let offset = -offsetToCenter;
    let columns = [];
    for (let i = 0; i < columnCnt; i++) {
      const style = {
        height: height,
        transform: `translate3d(${offset}px, 0px, 0px)`,
      }
      offset += offsetUnit;
      columns.push(
        <div className={styles.column} style={style} key={i}></div>
      );
    }
    return (
      <div className={styles.grid}>
        {columns}
      </div>
    )
  }
}

export default class EditorCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    }
  }

  // take advantage of arrow function to bind this automatically
  toggleGrid = () => {
    this.setState(state => ({
      dragging: !state.dragging
    }));
  }

  render() {
    const { dragging } = this.state;
    const canvasClassArray = [styles.canvas]
    if (dragging) {
      canvasClassArray.push(styles.lift);
    }
    const canvasClassName = canvasClassArray.join(' ');

    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div id={canvasId} className={canvasClassName}>
            { dragging && <Grid /> }
            <Button onClick={this.toggleGrid}>Toggle Grid</Button>
          </div>
        </div>
      </div>
    )
  }
}