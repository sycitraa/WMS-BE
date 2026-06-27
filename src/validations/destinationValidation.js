const Joi = require('joi');

const createDestinationSchema = Joi.object({
  destination_number: Joi.string().required(),
  destination_name: Joi.string().required(),
  destination_email: Joi.string().email().required(),
  destination_address: Joi.string().required()
});

const updateDestinationSchema = Joi.object({
  destination_number: Joi.string().optional(),
  destination_name: Joi.string().optional(),
  destination_email: Joi.string().email().optional(),
  destination_address: Joi.string().optional()
});

module.exports = {
  createDestinationSchema,
  updateDestinationSchema
};
