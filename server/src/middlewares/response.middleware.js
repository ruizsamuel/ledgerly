export const enrichResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (typeof data === 'object' && !Array.isArray(data) && !data.status) {
      data.status = res.statusCode;
    }

    return originalJson.call(this, data);
  };

  next();
};
