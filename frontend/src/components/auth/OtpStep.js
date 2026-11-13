import { useEffect, useState } from 'react';
import { Button, OtpInput } from '@/components/ui';
import styles from './Auth.module.scss';

const COOLDOWN = 60;

/** Bước nhập OTP dùng chung (đăng ký, quên mật khẩu); gửi lại mã sau 60 giây. */
const OtpStep = ({ email, onVerify, onResend, loading }) => {
    const [otp, setOtp] = useState('');
    const [wait, setWait] = useState(COOLDOWN);

    useEffect(() => {
        if (!wait) return;
        const t = setTimeout(() => setWait((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [wait]);

    const resend = async () => {
        await onResend();
        setWait(COOLDOWN);
        setOtp('');
    };

    return (
        <form
            className={styles.form}
            onSubmit={(e) => {
                e.preventDefault();
                onVerify(otp);
            }}
        >
            <p className={styles.muted}>
                Mã gồm 6 chữ số đã gửi tới <strong>{email}</strong>, có hiệu lực 5 phút.
            </p>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <Button type="submit" size="lg" block loading={loading} disabled={otp.length < 6}>
                Xác nhận mã
            </Button>
            <Button variant="ghost" onClick={resend} disabled={wait > 0 || loading}>
                {wait > 0 ? `Gửi lại mã sau ${wait} giây` : 'Gửi lại mã'}
            </Button>
        </form>
    );
};

export default OtpStep;
