import React from 'react';
const ErrorPage = ({ msg }) => {
  return (
    <div>
      <h1>Error Page</h1>
      <div>{msg}</div>
    </div>
  );
};
export default ErrorPage;
