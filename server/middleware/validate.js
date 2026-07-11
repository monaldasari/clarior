import Joi from "joi";

// Generic validation middleware factory
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true 
    });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return res.status(400).json({ error: messages });
    }
    req[property] = value; // Use sanitized values
    next();
  };
};

// ─── Auth Schemas ──────────────────────────────────────────────────────
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  rememberMe: Joi.boolean().optional(),
});

export const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Full name is required",
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid("Super Admin", "Admin", "Manager", "Employee", "Viewer").optional(),
});

// ─── Customer Schemas ──────────────────────────────────────────────────
export const customerSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(30).allow("", null).optional(),
  company: Joi.string().max(100).allow("", null).optional(),
  status: Joi.string().valid("Active", "Inactive", "Lead", "Prospect").optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
});

// ─── Lead Schemas ──────────────────────────────────────────────────────
export const leadSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().allow("", null).optional(),
  phone: Joi.string().max(30).allow("", null).optional(),
  company: Joi.string().max(100).allow("", null).optional(),
  source: Joi.string().max(50).optional(),
  status: Joi.string().valid("New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost").optional(),
  assigned_to: Joi.string().allow("", null).optional(),
  assigned_user_id: Joi.number().integer().allow(null).optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  notes: Joi.string().allow("", null).optional(),
});

// ─── Task Schemas ──────────────────────────────────────────────────────
export const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow("", null).optional(),
  assigned_to: Joi.string().allow("", null).optional(),
  assigned_user_id: Joi.number().integer().allow(null).optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  due_date: Joi.date().allow(null).optional(),
  completed: Joi.boolean().optional(),
  status: Joi.string().valid("Todo", "In Progress", "Done").optional(),
  category: Joi.string().max(50).optional(),
});

// ─── Note Schema ──────────────────────────────────────────────────────
export const noteSchema = Joi.object({
  note: Joi.string().min(1).max(2000).required().messages({
    "any.required": "Note content is required",
    "string.min": "Note cannot be empty",
  }),
});

// ─── Middleware Exports ────────────────────────────────────────────────
export const validateLogin = validate(loginSchema);
export const validateRegister = validate(registerSchema);
export const validateCustomer = validate(customerSchema);
export const validateLead = validate(leadSchema);
export const validateTask = validate(taskSchema);
export const validateNote = validate(noteSchema);
