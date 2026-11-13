export const formatMoney = (amount) => {
    if (typeof amount !== 'number') return '0₫';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
