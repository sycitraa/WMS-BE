const Joi = require('joi');

const createUserSchema = Joi.object({
  nama: Joi.string().required(),
  email: Joi.string().email().required(),
  id_role: Joi.number().required(),
  password: Joi.string().min(6).optional()
});

const updateUserSchema = Joi.object({
  nama: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  id_role: Joi.number().optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
