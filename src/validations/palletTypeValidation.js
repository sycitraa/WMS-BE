const Joi = require('joi');

const createPalletTypeSchema = Joi.object({
  pallet_category: Joi.string().required(),
  pallet_name: Joi.string().required()
});

const updatePalletTypeSchema = Joi.object({
  pallet_category: Joi.string().optional(),
  pallet_name: Joi.string().optional()
});

module.exports = {
  createPalletTypeSchema,
  updatePalletTypeSchema
};
