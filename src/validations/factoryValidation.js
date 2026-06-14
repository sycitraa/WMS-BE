const Joi = require('joi');

const createFactorySchema = Joi.object({
  factory_number: Joi.string().required(),
  factory_email: Joi.string().email().required(),
  factory_name: Joi.string().required(),
  factory_address: Joi.string().required()
});

const updateFactorySchema = Joi.object({
  factory_number: Joi.string().optional(),
  factory_email: Joi.string().email().optional(),
  factory_name: Joi.string().optional(),
  factory_address: Joi.string().optional()
});

module.exports = {
  createFactorySchema,
  updateFactorySchema
};
