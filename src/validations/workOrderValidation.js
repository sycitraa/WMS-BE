const Joi = require('joi');

const detailSchema = Joi.object({
  id_pallet_type: Joi.number().required(),
  id_storage_bins: Joi.number().required(),
  total_planning: Joi.number().min(1).required()
});

const createWorkOrderSchema = Joi.object({
  work_order_category: Joi.string().valid('INBOUND', 'OUTBOUND').required(),
  id_inbound_plan: Joi.number().when('work_order_category', {
    is: 'INBOUND',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  id_outbound_plan: Joi.number().when('work_order_category', {
    is: 'OUTBOUND',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  id_warehouse_area: Joi.number().required(),
  id_user: Joi.number().required(),
  transfer_point: Joi.string().allow('', null).optional(),
  date: Joi.date().required(),
  remarks: Joi.string().allow('', null).optional(),
  details: Joi.array().items(detailSchema).min(1).required()
});

const updateWorkOrderSchema = Joi.object({
  id_warehouse_area: Joi.number().optional(),
  id_user: Joi.number().optional(),
  transfer_point: Joi.string().allow('', null).optional(),
  date: Joi.date().optional(),
  remarks: Joi.string().allow('', null).optional(),
  details: Joi.array().items(detailSchema).min(1).required() // as per service code, details are required to overwrite
});

const updateWorkOrderStatusSchema = Joi.object({
  status: Joi.string().valid('ON_PROGRESS', 'DONE').required()
});

module.exports = {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  updateWorkOrderStatusSchema
};
