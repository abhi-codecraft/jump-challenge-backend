const successResponse = (message, data) => {
    return {
      status: 'success',
      message: message,
      data: data
    };
  };
  
  const errorResponse = (message, code, details) => {
    return {
      status: 'error',
      message: message,
      errors: {
        code: code,
        details: details
      }
    };
  };
  
  module.exports = {
    successResponse,
    errorResponse
  };
  