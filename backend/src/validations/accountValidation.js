import Joi from 'joi';

export const passwordRule = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
    .messages({
        'string.min': 'Mật khẩu tối thiểu 8 ký tự',
        'string.pattern.base': 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ thường',
    });

export const phoneRule = Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .messages({ 'string.pattern.base': 'Số điện thoại không hợp lệ' });

const registerSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30).required(),
    phone: phoneRule.required(),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required(),
    password: passwordRule.required(),
});

const profileSchema = Joi.object({
    name: Joi.string().trim().min(3).max(30),
    phone: phoneRule,
    password: passwordRule.allow(''),
});

// Trả về message lỗi đầu tiên hoặc null
const check = (schema) => (data) => schema.validate(data, { allowUnknown: true }).error?.details[0].message || null;

export const validateRegister = check(registerSchema);
export const validateProfile = check(profileSchema);
export const validatePassword = check(Joi.object({ password: passwordRule.required() }));
