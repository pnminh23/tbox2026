import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Button, PriceTag, Skeleton, Ticket } from '@/components/ui';
import { useUserData } from '@/services/account';
import { useAvailability } from '@/services/availability';
import { useAllBranches } from '@/services/branch';
import { useAllCombo } from '@/services/combo';
import { useAllFilms } from '@/services/films';
import { useAllTimeSlots } from '@/services/timeSlots';
import { checkPromotion } from '@/services/promotion';
import { createBooking } from '@/services/booking';
import { payBooking } from '@/services/payment';
import { formatMoney } from '@/function/formatMoney';
import {
    PAYMENT_THRESHOLD,
    comboOptions,
    dayKeyVN,
    depositOf,
    estimateTotal,
    extendRange,
    parseBookingQuery,
    rangeLabel,
    rangeMinutes,
    validateContact,
} from '@/lib/booking.mjs';
import ContactFields from './ContactFields';
import FilmPicker from './FilmPicker';
import ComboPicker from './ComboPicker';
import styles from './Checkout.module.scss';

const Checkout = () => {
    const router = useRouter();
    const today = dayKeyVN();
    const q = parseBookingQuery(router.query, today);
    const { user } = useUserData();
    const { branches } = useAllBranches();
    const { timeSlots: slots = [] } = useAllTimeSlots();
    const { rooms, error: loadError } = useAvailability(q.branch, q.date);
    const { allCombo = [] } = useAllCombo();
    const { films = [] } = useAllFilms();

    const [contact, setContact] = useState({ name: '', phone: '', email: '' });
    const [touched, setTouched] = useState({});
    // Chưa đụng tới (undefined) → theo phim trên URL; query chỉ có sau hydrate nên không đưa vào useState
    const [pickedFilm, setPickedFilm] = useState();
    const film = pickedFilm === undefined ? q.film : pickedFilm || undefined;
    const [combo, setCombo] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [promo, setPromo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [payType, setPayType] = useState('deposit');
    const [submitting, setSubmitting] = useState(false);
    const [conflict, setConflict] = useState(false);

    const backToGrid = { pathname: '/bookRoom', query: { branch: q.branch, date: q.date } };

    // Thiếu lựa chọn → quay về lưới
    useEffect(() => {
        if (router.isReady && (!q.branch || !q.room || q.start === undefined || q.end === undefined)) {
            router.replace('/bookRoom');
        }
    }, [router, q.branch, q.room, q.start, q.end]);

    const room = rooms?.find((r) => r._id === q.room);
    const range = useMemo(
        () =>
            room &&
            slots.length &&
            extendRange(slots, new Set(room.bookedSlots), q.date, { start: q.start, end: q.start }, q.end),
        [room, slots, q.date, q.start, q.end],
    );
    const minutes = range ? rangeMinutes(slots, range) : 0;
    const options = room ? comboOptions(allCombo, room.type._id, minutes) : [];
    const chosenCombo = allCombo.find((c) => c._id === combo);
    const total = range
        ? estimateTotal({
              pricePerMinute: room.type.pricePerMinute,
              minutes,
              combo: chosenCombo,
              typeId: room.type._id,
              discountPercent: promo?.discountPercent || 0,
          })
        : 0;
    const needPay = total > PAYMENT_THRESHOLD;
    const errors = user ? {} : validateContact(contact);
    const branchName = branches?.find((b) => b._id === q.branch)?.name;
    const filmName = films.find((f) => f._id === film)?.name;

    const applyPromo = async () => {
        if (!promoCode.trim()) return;
        const result = await checkPromotion(promoCode.trim());
        if (result.success) {
            setPromo(result.data);
            setPromoError('');
        } else {
            setPromo(null);
            setPromoError(result.message);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length) return setTouched({ name: true, phone: true, email: true });

        setSubmitting(true);
        const result = await createBooking({
            ...(user
                ? {}
                : { name_client: contact.name.trim(), phone: contact.phone.trim(), email: contact.email.trim() }),
            room: room._id,
            date: q.date,
            time_slots: slots.slice(range.start, range.end + 1).map((s) => s._id),
            film,
            combo: combo || undefined,
            promotion: promo?.name,
        });

        if (!result.success) {
            setSubmitting(false);
            if (result.status === 409) return setConflict(true);
            return toast.error(result.message);
        }

        const booking = result.data.data;
        if (result.data.paymentRequired) {
            const paid = await payBooking(booking.id_booking, payType);
            if (!paid.success) {
                toast.error(paid.message);
                router.push(`/bookRoom/${booking.id_booking}`);
            }
            return;
        }
        router.push(`/bookRoom/${booking.id_booking}?new=1`);
    };

    if (loadError)
        return (
            <div className={styles.state} role="alert">
                <p>Chưa tải được thông tin phòng.</p>
                <Button variant="outline" href={backToGrid}>
                    Quay lại chọn giờ
                </Button>
            </div>
        );

    if (!rooms || !slots.length)
        return (
            <div className={styles.page} aria-busy="true">
                <div className={styles.main}>
                    <Skeleton h={60} w="60%" />
                    <Skeleton h={160} />
                </div>
            </div>
        );

    if (conflict || !range)
        return (
            <div className={styles.state} role="alert">
                <h1>Khung giờ này vừa có người đặt</h1>
                <p>Bạn chọn giờ khác nhé, lựa chọn ngày và cơ sở vẫn được giữ nguyên.</p>
                <Button href={backToGrid}>Chọn giờ khác</Button>
            </div>
        );

    return (
        <form className={styles.page} onSubmit={submit} noValidate>
            <div className={styles.main}>
                <Link href={{ pathname: '/bookRoom', query: { ...router.query } }} className={styles.back}>
                    Đổi phòng hoặc giờ
                </Link>
                <h1>Sắp xong rồi</h1>

                <section aria-labelledby="ck-contact" className={styles.section}>
                    <h2 id="ck-contact">Liên hệ</h2>
                    {user ? (
                        <p className={styles.muted}>
                            Vé sẽ gửi tới <strong>{user.email}</strong>, số điện thoại {user.phone}.
                        </p>
                    ) : (
                        <>
                            <p className={styles.muted}>
                                Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link> để điền sẵn và xem lại đơn
                                sau này.
                            </p>
                            <ContactFields
                                value={contact}
                                errors={errors}
                                touched={touched}
                                onChange={(key, val) => setContact((c) => ({ ...c, [key]: val }))}
                                onBlur={(key) => setTouched((t) => ({ ...t, [key]: true }))}
                            />
                        </>
                    )}
                </section>

                <section aria-labelledby="ck-film" className={styles.section}>
                    <div className={styles.sectionHead}>
                        <h2 id="ck-film">Phim muốn xem</h2>
                        <span className={styles.muted}>Không bắt buộc, có thể chọn tại phòng</span>
                    </div>
                    <FilmPicker films={films.slice(0, 10)} value={film} onChange={(id) => setPickedFilm(id ?? null)} />
                </section>

                <section aria-labelledby="ck-combo" className={styles.section}>
                    <h2 id="ck-combo">Thêm combo</h2>
                    <ComboPicker options={options} value={combo} onChange={setCombo} />
                </section>

                <section aria-labelledby="ck-promo" className={styles.section}>
                    <h2 id="ck-promo">Mã giảm giá</h2>
                    <div className={styles.promo}>
                        <label className={styles.field}>
                            <span className="sr-only">Mã giảm giá</span>
                            <input
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                                placeholder="Ví dụ: BOXNOEL"
                                aria-invalid={!!promoError}
                                aria-describedby={promoError ? 'promo-error' : undefined}
                            />
                        </label>
                        <Button variant="outline" onClick={applyPromo}>
                            Áp dụng
                        </Button>
                    </div>
                    {promoError && (
                        <p id="promo-error" className={styles.error}>
                            {promoError}
                        </p>
                    )}
                    {promo && (
                        <p className={styles.applied} role="status">
                            Đã áp dụng {promo.name}, giảm {promo.discountPercent}%
                        </p>
                    )}
                </section>
            </div>

            <aside className={styles.aside} aria-label="Vé và thanh toán">
                <Ticket
                    direction="vertical"
                    main={
                        <div className={styles.ticketMain}>
                            <h2>Vé của bạn</h2>
                            <dl>
                                <dt>Cơ sở</dt>
                                <dd>{branchName}</dd>
                                <dt>Phòng</dt>
                                <dd>
                                    {room.name}, {room.type.name}
                                </dd>
                                <dt>Thời gian</dt>
                                <dd>
                                    {q.date.split('-').reverse().join('/')}, {rangeLabel(slots, range)}
                                </dd>
                                <dt>Phim</dt>
                                <dd key={filmName || 'later'} className={styles.flash}>
                                    {filmName || 'Chọn tại phòng'}
                                </dd>
                                {chosenCombo && (
                                    <>
                                        <dt>Combo</dt>
                                        <dd className={styles.flash}>{chosenCombo.name}</dd>
                                    </>
                                )}
                            </dl>
                        </div>
                    }
                    stub={
                        <div className={styles.ticketStub}>
                            <div className={styles.total}>
                                <span>Tổng tiền</span>
                                <PriceTag value={total} className={styles.price} />
                            </div>
                            {needPay && (
                                <fieldset className={styles.payChoice}>
                                    <legend>Thanh toán bây giờ</legend>
                                    {[
                                        ['deposit', 'Cọc 50%', depositOf(total)],
                                        ['full', 'Trả đủ', total],
                                    ].map(([type, label, amount]) => (
                                        <label key={type} className={payType === type ? styles.checked : undefined}>
                                            <input
                                                type="radio"
                                                name="pay"
                                                value={type}
                                                checked={payType === type}
                                                onChange={() => setPayType(type)}
                                            />
                                            <span>{label}</span>
                                            <strong>{formatMoney(amount)}</strong>
                                        </label>
                                    ))}
                                </fieldset>
                            )}
                            <Button type="submit" size="lg" block loading={submitting}>
                                {needPay ? 'Thanh toán qua PayOS' : 'Xác nhận đặt phòng'}
                            </Button>
                            <p className={styles.note}>
                                {needPay
                                    ? 'Phòng được giữ 15 phút sau khi bạn bấm thanh toán. Phần còn lại trả tại quầy hoặc online trong lịch sử đặt phòng.'
                                    : 'Đơn từ 150.000đ trở xuống thanh toán tại quầy. Vé được gửi về email ngay.'}
                            </p>
                        </div>
                    }
                />
            </aside>
        </form>
    );
};

export default Checkout;
