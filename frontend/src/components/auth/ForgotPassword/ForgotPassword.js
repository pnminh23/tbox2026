import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button, Field } from '@/components/ui';
import LayoutAuth from '@/layout/LayoutAuth/LayoutAuth';
import { forgotPassword, resetPassword, verifyOtpResetPassword } from '@/services/auth';
import { validatePassword } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import OtpStep from '../OtpStep';
import styles from '../Auth.module.scss';

const TITLES = { email: 'Quên mật khẩu', otp: 'Nhập mã xác nhận', reset: 'Đặt mật khẩu mới' };

/** 3 bước: email → OTP → mật khẩu mới. */
const ForgotPassword = () => {
    const router = useRouter();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Gợi ý email đã dùng ở lần đăng nhập trước
    useEffect(() => setEmail(localStorage.getItem('email') || ''), []);

    const passwordError = validatePassword(password);
    const confirmError = !passwordError && confirm !== password ? 'Mật khẩu nhập lại chưa khớp' : '';

    const run = async (action) => {
        setLoading(true);
        setError('');
        try {
            await action();
        } catch (message) {
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const sendCode = (e) => {
        e?.preventDefault();
        return run(async () => {
            await forgotPassword(email.trim());
            setStep('otp');
        });
    };

    const verify = (otp) =>
        run(async () => {
            await verifyOtpResetPassword(email.trim(), otp);
            setStep('reset');
        });

    const reset = (e) => {
        e.preventDefault();
        setTouched(true);
        if (passwordError || confirmError) return;
        run(async () => {
            await resetPassword(email.trim(), password);
            toast.success('Đã đổi mật khẩu, mời bạn đăng nhập lại');
            router.push(PATH.Login);
        });
    };

    return (
        <LayoutAuth
            title={TITLES[step]}
            lead={step === 'email' ? 'Nhập email tài khoản, chúng tôi sẽ gửi mã xác nhận.' : undefined}
        >
            {error && (
                <p className={styles.alert} role="alert">
                    {error}
                </p>
            )}
            {step === 'email' && (
                <form className={styles.form} onSubmit={sendCode}>
                    <Field
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" size="lg" block loading={loading} disabled={!email.trim()}>
                        Gửi mã xác nhận
                    </Button>
                    <p className={styles.switch}>
                        Nhớ ra rồi? <Link href={PATH.Login}>Đăng nhập</Link>
                    </p>
                </form>
            )}
            {step === 'otp' && <OtpStep email={email} loading={loading} onVerify={verify} onResend={sendCode} />}
            {step === 'reset' && (
                <form className={styles.form} onSubmit={reset} noValidate>
                    <Field
                        label="Mật khẩu mới"
                        type="password"
                        autoComplete="new-password"
                        hint="Tối thiểu 8 ký tự, có chữ hoa và chữ thường"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={touched && passwordError}
                        required
                    />
                    <Field
                        label="Nhập lại mật khẩu"
                        type="password"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        error={touched && confirmError}
                        required
                    />
                    <Button type="submit" size="lg" block loading={loading}>
                        Đổi mật khẩu
                    </Button>
                </form>
            )}
        </LayoutAuth>
    );
};

export default ForgotPassword;
