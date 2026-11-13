import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import avatar from '@public/static/img/avatar/panda.png';
import { Button, Field } from '@/components/ui';
import { updateMe, useUserData } from '@/services/account';
import { validateContact } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import style from './AccountPage.module.scss';

const MAX_SIZE = 5 * 1024 * 1024; // đồng bộ giới hạn upload ở backend

const AccountPage = () => {
    const { user } = useUserData();
    const [form, setForm] = useState({ name: '', phone: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name || '', phone: user.phone || '' });
    }, [user]);

    // Dọn URL xem trước ảnh khi đổi ảnh / rời trang
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    // Dùng lại quy tắc liên hệ, bỏ qua email (không sửa ở đây)
    const { email, ...errors } = validateContact({ ...form, email: user?.email || '' });

    const pickFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return toast.error('Chỉ nhận ảnh JPG, PNG, WEBP');
        if (f.size > MAX_SIZE) return toast.error('Ảnh tối đa 5MB');
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const save = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length) return;
        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', form.name.trim());
            data.append('phone', form.phone.trim());
            if (file) data.append('image', file);
            await updateMe(data);
            toast.success('Đã lưu thông tin tài khoản');
            setFile(null);
        } catch (err) {
            toast.error(err.message || 'Lưu thất bại, vui lòng thử lại');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <form className={style.form} onSubmit={save} noValidate>
            <div className={style.avatar}>
                <Image src={preview || user.image || avatar} alt="Ảnh đại diện" width={96} height={96} />
                <label className={style.upload}>
                    Đổi ảnh
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={pickFile}
                        className="sr-only"
                    />
                </label>
            </div>
            <div className={style.fields}>
                <Field
                    label="Họ và tên"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    error={errors.name}
                />
                <Field
                    label="Số điện thoại"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    error={errors.phone}
                />
                <Field label="Email" value={user.email} readOnly hint="Email dùng để đăng nhập, không đổi được" />
            </div>
            <div className={style.actions}>
                <Button type="submit" loading={saving} disabled={!!Object.keys(errors).length}>
                    Lưu thay đổi
                </Button>
                <Link href={PATH.ForgotPassword}>Đổi mật khẩu</Link>
            </div>
        </form>
    );
};

export default AccountPage;
