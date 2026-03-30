const errorHandler = (err, req, res, next) => {
    console.error(err); // replace with logger later

    if (err.name === 'CastError') {
        return res.status(400).json({
          message: 'Invalid ID format'
        });
      }
  
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
export default errorHandler;