function success(res, message, data = null, metadata = null, statusCode = 200) {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (metadata !== null) {
    response.metadata = metadata;
  }

  return res.status(statusCode).json(response);
}

function error(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  success,
  error,
};