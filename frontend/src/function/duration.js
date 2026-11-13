// Thời lượng phim dạng tự do ("120", "120 phút", "2h10", "2 giờ 10 phút") → số phút
export const durationMinutes = (value) => {
    const text = String(value ?? "").toLowerCase();
    const hm = text.match(/(\d+)\s*(?:h|giờ|tiếng)\s*(\d+)?/);
    if (hm) return Number(hm[1]) * 60 + Number(hm[2] || 0);
    return parseInt(text, 10) || 0;
};
