import React, { Component } from 'react';
import { Collapse, Button } from 'reactstrap';


class Collapsible extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { collapsed: true };
  }
  toggle() {
    this.props.onCollapse();
    this.setState({ collapsed: !this.state.collapsed });
  }
  render() {
    const { collapsed } = this.state;
    const showHide = collapsed ?
      <i className='fa fa-angle-double-up' aria-hidden='true' /> :
      <i className='fa fa-angle-double-down' aria-hidden='true' />;

    return (
      <div>
        <Collapse isOpen={!collapsed}>
          {this.props.children}
        </Collapse>

        <Button onClick={this.toggle} style={{ float: 'right', marginLeft: '1em' }}>
          {showHide}
        </Button>
      </div>
    );
  }
}


export default Collapsible;
