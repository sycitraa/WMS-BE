const { errorResponse } = require('../utils/responseFormatter');

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return errorResponse(res, 400, messages.join(', '));
  }
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return errorResponse(res, 400, messages.join(', '));
  }
  next();
};

module.exports = {
  validateBody,
  validateQuery
};
