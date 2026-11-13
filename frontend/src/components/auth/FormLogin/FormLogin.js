import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button, Field } from '@/components/ui';
import LayoutAuth from '@/layout/LayoutAuth/LayoutAuth';
import { login } from '@/services/auth';
import { PATH } from '@/constants/config';
import styles from '../Auth.module.scss';

const FormLogin = () => {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await login(form.email.trim(), form.password);
            localStorage.setItem('email', form.email.trim()); // gợi ý sẵn ở form quên mật khẩu
            toast.success('Đăng nhập thành công');
            router.push(router.query.next || (res.role === 'admin' ? PATH.BookRoomManagement : PATH.Home));
        } catch (message) {
            setError(message);
            setLoading(false);
        }
    };

    return (
        <LayoutAuth title="Đăng nhập" lead="Xem lại vé, thanh toán tiếp và đặt nhanh hơn ở lần sau.">
            <form className={styles.form} onSubmit={submit}>
                {error && (
                    <p className={styles.alert} role="alert">
                        {error}
                    </p>
                )}
                <Field
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    required
                />
                <Field
                    label="Mật khẩu"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={set('password')}
                    required
                />
                <div className={styles.row}>
                    <Link href={PATH.ForgotPassword}>Quên mật khẩu?</Link>
                </div>
                <Button type="submit" size="lg" block loading={loading} disabled={!form.email || !form.password}>
                    Đăng nhập
                </Button>
                <p className={styles.switch}>
                    Chưa có tài khoản? <Link href={PATH.Register}>Đăng ký</Link>
                </p>
            </form>
        </LayoutAuth>
    );
};

export default FormLogin;
