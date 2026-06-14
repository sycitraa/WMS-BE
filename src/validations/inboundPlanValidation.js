const Joi = require('joi');

const detailSchema = Joi.object({
  id_pallet_type: Joi.number().required(),
  id_factory: Joi.number().required(),
  quantity: Joi.number().min(1).required()
});

const createInboundPlanSchema = Joi.object({
  planning_month: Joi.date().required(),
  remarks: Joi.string().allow('', null).optional(),
  details: Joi.array().items(detailSchema).min(1).required()
});

const updateInboundPlanSchema = Joi.object({
  planning_month: Joi.date().optional(),
  remarks: Joi.string().allow('', null).optional(),
  details: Joi.array().items(detailSchema).min(1).required()
});

const updateInboundPlanStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVE', 'REJECT').required()
});

module.exports = {
  createInboundPlanSchema,
  updateInboundPlanSchema,
  updateInboundPlanStatusSchema
};
