import Image from 'next/image';
import Link from 'next/link';
import decor1 from '@public/static/img/decor/1.webp';
import decor2 from '@public/static/img/decor/2.webp';
import decor3 from '@public/static/img/decor/3.webp';
import decor4 from '@public/static/img/decor/4.webp';
import { Button, PageIntro, Reveal, Skeleton, Ticket } from '@/components/ui';
import { useAllCombo } from '@/services/combo';
import { formatMoney } from '@/function/formatMoney';
import { formatDuration } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import style from './ComboPage.module.scss';

const DECOR = [decor1, decor2, decor3, decor4];
const minPrice = (combo) => Math.min(...combo.types.map((t) => t.price));

const ComboPage = () => {
    const { allCombo, isLoading, error } = useAllCombo();

    return (
        <>
            <PageIntro
                title="Combo đặt phòng"
                lead="Gói sẵn thời gian dùng phòng, đồ ăn và đồ uống. Giá theo loại phòng, chọn combo ở bước xác nhận."
            />

            <section className={style.section} aria-label="Danh sách combo">
                {error && <p role="alert">Chưa tải được combo, bạn thử tải lại trang nhé.</p>}
                {isLoading && (
                    <div className={style.list} aria-busy="true">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} h={150} radius={14} />
                        ))}
                    </div>
                )}
                {allCombo?.length === 0 && <p className={style.muted}>Hiện chưa có combo nào.</p>}
                {allCombo?.length > 0 && (
                    <Reveal className={style.list}>
                        {allCombo.map((combo) => (
                            <Ticket
                                key={combo._id}
                                main={
                                    <div className={style.main}>
                                        <h2>{combo.name}</h2>
                                        <p>{combo.description}</p>
                                        <p className={style.duration}>{formatDuration(combo.duration)} dùng phòng</p>
                                        <ul className={style.prices}>
                                            {combo.types.map((t) => (
                                                <li key={t.typeRoom?._id}>
                                                    <span>Phòng {t.typeRoom?.name}</span>
                                                    <strong>{formatMoney(t.price)}</strong>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                }
                                stub={
                                    <div className={style.stub}>
                                        <small>từ</small>
                                        <strong>{Math.round(minPrice(combo) / 1000)}K</strong>
                                        <Link
                                            href={{ pathname: PATH.BookRoom, query: { duration: combo.duration } }}
                                            className={style.stubLink}
                                            aria-label={`Đặt phòng ${formatDuration(combo.duration)} cho ${combo.name}`}
                                        >
                                            Đặt combo này
                                        </Link>
                                    </div>
                                }
                                stubTone="gold"
                            />
                        ))}
                    </Reveal>
                )}
            </section>

            <section className={style.decor} aria-labelledby="decor-title">
                <div className={style.decorText}>
                    <h2 id="decor-title">Trang trí theo dịp</h2>
                    <p>
                        Phòng được trang trí theo chủ đề và thay đổi theo các dịp đặc biệt như Valentine, Noel hay sinh
                        nhật. Ánh đèn nhẹ, decor tinh tế cho buổi hẹn hò hay kỷ niệm đáng nhớ.
                    </p>
                    <Button variant="outline" href={PATH.Locations}>
                        Liên hệ cơ sở để đặt trang trí
                    </Button>
                </div>
                <Reveal className={style.decorGrid}>
                    {DECOR.map((img, i) => (
                        <div key={i} className={style.decorImg}>
                            <Image
                                src={img}
                                alt={`Phòng trang trí mẫu ${i + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>
                    ))}
                </Reveal>
            </section>
        </>
    );
};

export default ComboPage;
