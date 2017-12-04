import React from 'react';


const NoResults = props => {
  const { errors } = props;
  const style = { position: 'absolute' };

  if (errors.recent && errors.recent.message.includes('No results')) {
    return (
      <div style={style}>
        <p>{errors.recent.message}</p>
      </div>
    );
  }
  return null;
};


export default NoResults;
