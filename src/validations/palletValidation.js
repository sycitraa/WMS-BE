const Joi = require('joi');

const createPalletSchema = Joi.object({
  rfid_tag: Joi.string().required(),
  id_pallet_type: Joi.number().required(),
  location: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional()
});

const updatePalletSchema = Joi.object({
  rfid_tag: Joi.string().optional(),
  id_pallet_type: Joi.number().optional(),
  location: Joi.string().optional(),
  status: Joi.string().optional()
});

module.exports = {
  createPalletSchema,
  updatePalletSchema
};
