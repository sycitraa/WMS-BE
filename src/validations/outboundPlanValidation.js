const Joi = require('joi');

const detailSchema = Joi.object({
  id_pallet_type: Joi.number().required(),
  id_destination: Joi.number().required(),
  quantity: Joi.number().min(1).required()
});

const createOutboundPlanSchema = Joi.object({
  planning_month: Joi.date().required(),
  remarks: Joi.string().allow('', null).optional(),
  details: Joi.array().items(detailSchema).min(1).required()
});

const updateOutboundPlanSchema = Joi.object({
  planning_month: Joi.date().optional(),
  remarks: Joi.string().allow('', null).optional(),
  details: Joi.array().items(detailSchema).min(1).required()
});

const updateOutboundPlanStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVE', 'REJECT').required(),
  remarks: Joi.string().allow('', null).optional()
});

module.exports = {
  createOutboundPlanSchema,
  updateOutboundPlanSchema,
  updateOutboundPlanStatusSchema
};
