import React, { Component } from 'react';


const formatTime = time => {
  time = parseInt(time, 10);
  let minutes = parseInt(time / 60, 10);
  let seconds = time - (minutes * 60);
  if (time < 59) {
    minutes = 0;
    seconds = time;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return minutes + ':' + seconds;
};

class Timer extends Component {
  constructor(props) {
    super(props);
    this.tick = this.tick.bind(this);
    this.state = { timer: null, counter: 0 };
  }
  componentDidMount() {
    const timer = setInterval(this.tick, 1000);
    this.setState({ timer, counter: this.props.elapsed });
  }
  componentWillUnmount() {
    clearInterval(this.state.timer);
  }
  tick() {
    this.setState({ counter: this.state.counter + 1 });
  }
  render() {
    return (
      <span>{formatTime(this.state.counter)}</span>
    );
  }
}

const Counter = props => {
  const { playerState, duration, elapsed } = props;
  const displayDuration = <span>/ {formatTime(duration)}</span>;
  const displayElapsed = playerState === 1 ?
    <Timer elapsed={elapsed} /> :
    <span>{formatTime(elapsed)}</span>;

  return (
    <div className='counter'>
      {displayElapsed}{displayDuration}
    </div>
  );
};


export default Counter;
