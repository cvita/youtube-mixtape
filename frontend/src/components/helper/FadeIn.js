import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';


const FadeIn = props => (
  <CSSTransitionGroup
    transitionName='fadeInOnLoad'
    transitionAppear={true}
    transitionAppearTimeout={500}
    transitionEnter={false}
    transitionLeave={false}>

    {props.children}

  </CSSTransitionGroup>
);


export default FadeIn;
