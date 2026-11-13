import { useRef } from 'react';
import styles from './OtpInput.module.scss';

const LENGTH = 6;

/** 6 ô nhập OTP: gõ tự sang ô kế, Backspace lùi lại, dán / tự điền cả mã. value: string */
const OtpInput = ({ value, onChange, label = 'Mã OTP', disabled }) => {
    const refs = useRef([]);
    const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

    const setAt = (i, d) => {
        const next = [...digits];
        next[i] = d;
        onChange(next.join(''));
    };

    // Gõ 1 số → sang ô kế; nhận nhiều số một lúc (tự điền OTP của điện thoại, dán) → rải sang các ô sau
    const fill = (i, raw) => {
        const code = raw.replace(/\D/g, '');
        if (code.length <= 1) {
            setAt(i, code);
            if (code && i < LENGTH - 1) refs.current[i + 1]?.focus();
            return;
        }
        const next = [...digits];
        code.slice(0, LENGTH - i)
            .split('')
            .forEach((d, k) => (next[i + k] = d));
        onChange(next.join(''));
        refs.current[Math.min(i + code.length, LENGTH - 1)]?.focus();
    };

    // Gõ đè lên ô đã có số: chỉ lấy ký tự vừa gõ
    const onInput = (i, v) => {
        const typed = digits[i] && v.length === 2 ? (v[0] === digits[i] ? v[1] : v[0]) : v;
        fill(i, typed.slice(-LENGTH));
    };

    const onKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    };

    const onPaste = (i, e) => {
        e.preventDefault();
        fill(i, e.clipboardData.getData('text'));
    };

    return (
        <div role="group" aria-label={label} className={styles.otp}>
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    value={d}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Chữ số ${i + 1}`}
                    disabled={disabled}
                    onChange={(e) => onInput(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onPaste={(e) => onPaste(i, e)}
                />
            ))}
        </div>
    );
};

export default OtpInput;
