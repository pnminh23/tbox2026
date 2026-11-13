// Gom khoảng trắng thừa
export const formatString = (input) => (typeof input === 'string' ? input.trim().replace(/\s+/g, ' ') : '');

// Giữ keepStart ký tự đầu và keepEnd ký tự cuối, phần giữa thay bằng *
const mask = (str = '', keepStart = 2, keepEnd = 2) => {
    const hidden = str.length - keepStart - keepEnd;
    return hidden <= 0
        ? '*'.repeat(str.length)
        : str.slice(0, keepStart) + '*'.repeat(hidden) + str.slice(str.length - keepEnd);
};

export const maskEmail = (email = '') => {
    const [name, domain] = email.split('@');
    return domain ? `${mask(name, 2, 0)}@${domain}` : mask(email);
};

export const maskPhone = (phone = '') => mask(phone, 3, 2);
