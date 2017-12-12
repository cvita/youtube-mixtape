import React from 'react';
import { Alert } from 'reactstrap';


const NoResults = props => {
  const { errors } = props;


  if (errors.recent && errors.recent.message.includes('No results')) {
    return (
        <Alert color='danger'>
          <p className='text-center'>{errors.recent.message}</p>
        </Alert>
    );
  }
  return null;
};


export default NoResults;
