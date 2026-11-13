import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button, Field } from '@/components/ui';
import LayoutAuth from '@/layout/LayoutAuth/LayoutAuth';
import { register, resendOtp, verifyAccount } from '@/services/auth';
import { validateRegister } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import OtpStep from '../OtpStep';
import styles from '../Auth.module.scss';

const FIELDS = [
    { key: 'name', label: 'Họ và tên', autoComplete: 'name' },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', autoComplete: 'tel', inputMode: 'numeric' },
    { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    {
        key: 'password',
        label: 'Mật khẩu',
        type: 'password',
        autoComplete: 'new-password',
        hint: 'Tối thiểu 8 ký tự, có chữ hoa và chữ thường',
    },
    { key: 'confirm', label: 'Nhập lại mật khẩu', type: 'password', autoComplete: 'new-password' },
];

/** Đăng ký 2 bước: điền thông tin → nhập OTP gửi qua email. */
const FormRegister = () => {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
    const [touched, setTouched] = useState({});
    const [step, setStep] = useState('form');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const errors = validateRegister(form);

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

    const submit = (e) => {
        e.preventDefault();
        if (Object.keys(errors).length) return setTouched(Object.fromEntries(FIELDS.map((f) => [f.key, true])));
        run(async () => {
            await register(form.name.trim(), form.phone.trim(), form.email.trim(), form.password);
            setStep('otp');
        });
    };

    const verify = (otp) =>
        run(async () => {
            await verifyAccount(form.email.trim(), otp);
            toast.success('Tạo tài khoản thành công, mời bạn đăng nhập');
            router.push(PATH.Login);
        });

    return (
        <LayoutAuth
            title={step === 'form' ? 'Đăng ký' : 'Xác thực email'}
            lead={step === 'form' ? 'Lưu lại lịch sử đặt phòng và nhận ưu đãi.' : undefined}
        >
            {error && (
                <p className={styles.alert} role="alert">
                    {error}
                </p>
            )}
            {step === 'form' ? (
                <form className={styles.form} onSubmit={submit} noValidate>
                    {FIELDS.map(({ key, ...field }) => (
                        <Field
                            key={key}
                            {...field}
                            value={form[key]}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
                            error={touched[key] && errors[key]}
                            required
                        />
                    ))}
                    <Button type="submit" size="lg" block loading={loading}>
                        Tạo tài khoản
                    </Button>
                    <p className={styles.switch}>
                        Đã có tài khoản? <Link href={PATH.Login}>Đăng nhập</Link>
                    </p>
                </form>
            ) : (
                <OtpStep
                    email={form.email}
                    loading={loading}
                    onVerify={verify}
                    onResend={() => run(() => resendOtp(form.email.trim()))}
                />
            )}
        </LayoutAuth>
    );
};

export default FormRegister;
