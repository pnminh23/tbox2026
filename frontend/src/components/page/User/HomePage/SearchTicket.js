import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Ticket } from '@/components/ui';
import { useAllBranches } from '@/services/branch';
import { useAllTimeSlots } from '@/services/timeSlots';
import { DEFAULT_MINUTES, dayKeyVN, formatDuration, isPastSlot } from '@/lib/booking.mjs';
import styles from './SearchTicket.module.scss';

const DURATIONS = [90, 120, 150, 180];

/** Ô tìm phòng dạng vé: chọn cơ sở / ngày / giờ / thời lượng rồi mở lưới đặt phòng. */
const SearchTicket = ({ className, id }) => {
    const router = useRouter();
    const { branches } = useAllBranches();
    const { timeSlots = [] } = useAllTimeSlots();
    const today = dayKeyVN();
    const [form, setForm] = useState({ branch: '', date: today, start: '', duration: DEFAULT_MINUTES });

    // Giờ bắt đầu: bỏ các khung đã qua nếu chọn hôm nay
    const starts = useMemo(
        () =>
            timeSlots
                .map((slot, index) => ({ slot, index }))
                .filter(({ slot }) => form.date !== today || !isPastSlot(today, slot)),
        [timeSlots, form.date, today],
    );

    useEffect(() => {
        if (!form.branch && branches?.length) setForm((f) => ({ ...f, branch: branches[0]._id }));
    }, [branches, form.branch]);

    useEffect(() => {
        if (starts.length && !starts.some((s) => String(s.index) === String(form.start))) {
            const evening = starts.find(({ slot }) => slot.start_time >= '19:00') || starts[0];
            setForm((f) => ({ ...f, start: evening.index }));
        }
    }, [starts, form.start]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        router.push({ pathname: '/bookRoom', query: form });
    };

    return (
        <form id={id} onSubmit={submit} aria-label="Tìm phòng trống" className={className}>
            <Ticket
                main={
                    <div className={styles.fields}>
                        <label className={styles.field}>
                            Cơ sở
                            <select value={form.branch} onChange={set('branch')} required>
                                {branches?.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.field}>
                            Ngày
                            <input type="date" value={form.date} min={today} onChange={set('date')} required />
                        </label>
                        <label className={styles.field}>
                            Bắt đầu
                            <select value={form.start} onChange={set('start')} required disabled={!starts.length}>
                                {starts.length ? (
                                    starts.map(({ slot, index }) => (
                                        <option key={slot._id} value={index}>
                                            {slot.start_time}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Hết giờ hôm nay</option>
                                )}
                            </select>
                        </label>
                        <label className={styles.field}>
                            Thời lượng
                            <select value={form.duration} onChange={set('duration')}>
                                {DURATIONS.map((m) => (
                                    <option key={m} value={m}>
                                        {formatDuration(m)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                }
                stub={
                    <div className={styles.stub}>
                        <Button type="submit" size="lg" block disabled={!starts.length}>
                            Tìm phòng trống
                        </Button>
                    </div>
                }
            />
        </form>
    );
};

export default SearchTicket;
