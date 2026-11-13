import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import heroImg from '@public/static/img/hero-room.jpg';
import { Button, Reveal, Ticket } from '@/components/ui';
import useInView from '@/hooks/useInView';
import { useAllBranches } from '@/services/branch';
import { useAllCombo } from '@/services/combo';
import { formatDuration } from '@/lib/booking.mjs';
import SearchTicket from './SearchTicket';
import TonightRooms from './TonightRooms';
import style from './HomePage.module.scss';

const PROMISES = [
    ['Không camera', 'Cam kết riêng tư tuyệt đối trong phòng'],
    ['Tài khoản Premium', 'Netflix, YouTube, FPT Play có sẵn'],
    ['Đồ ăn tận phòng', 'Đảm bảo vệ sinh an toàn thực phẩm'],
    ['Từ 18 tuổi', 'Dành cho khách trên 18 tuổi'],
];

const shortPrice = (n) => `${Math.round(n / 1000)}K`;
const minPrice = (combo) => Math.min(...combo.types.map((t) => t.price));

const Home = () => {
    const { allCombo } = useAllCombo();
    const { branches } = useAllBranches();
    // Nút ghim đáy (mobile) chỉ hiện khi ô tìm phòng đã cuộn khỏi màn hình
    const [heroRef, heroSeen] = useInView({ threshold: 0, rootMargin: '0px', once: false, initial: true });

    return (
        <>
            <section className={style.hero}>
                <Image src={heroImg} alt="" fill priority sizes="100vw" placeholder="blur" className={style.heroImg} />
                <div className={style.beam} aria-hidden="true" />
                <div className={style.heroInner}>
                    <div className={style.heroText}>
                        <h1>Phòng chiếu của riêng bạn, ngay giữa Hà Nội</h1>
                        <p>
                            Chọn giờ, vào phòng, tắt đèn. Netflix, YouTube và FPT Play có sẵn, đồ uống mang tới tận cửa.
                        </p>
                    </div>
                    <div ref={heroRef} className={style.heroTicket}>
                        <SearchTicket id="search-ticket" />
                    </div>
                </div>
            </section>

            <TonightRooms />

            {allCombo?.length > 0 && (
                <section className={style.section} aria-labelledby="combo-title">
                    <h2 id="combo-title" className={style.title}>
                        Combo cho hai người
                    </h2>
                    <p className={style.lead}>Đã gồm thời gian dùng phòng, đồ ăn và 2 đồ uống tự chọn</p>
                    <Reveal className={style.combos}>
                        {allCombo.map((combo) => (
                            <Link
                                key={combo._id}
                                href={{ pathname: '/bookRoom', query: { duration: combo.duration } }}
                                className={style.comboLink}
                                aria-label={`${combo.name}, từ ${shortPrice(minPrice(combo))}, đặt phòng ${formatDuration(combo.duration)}`}
                            >
                                <Ticket
                                    main={
                                        <div className={style.comboMain}>
                                            <strong>{combo.name}</strong>
                                            <span>{combo.description}</span>
                                            <span>{formatDuration(combo.duration)} dùng phòng</span>
                                        </div>
                                    }
                                    stub={
                                        <div className={style.comboStub}>
                                            <small>từ</small>
                                            {shortPrice(minPrice(combo))}
                                        </div>
                                    }
                                    stubTone="gold"
                                />
                            </Link>
                        ))}
                    </Reveal>
                </section>
            )}

            <section className={style.section} aria-label="Cam kết của PNM BOX">
                <Reveal as="ul" className={style.promises}>
                    {PROMISES.map(([title, text]) => (
                        <li key={title}>
                            <strong>{title}</strong>
                            <span>{text}</span>
                        </li>
                    ))}
                </Reveal>
            </section>

            {branches?.length > 0 && (
                <section className={style.section} aria-labelledby="branch-title">
                    <h2 id="branch-title" className={style.title}>
                        {branches.length} cơ sở ở Hà Nội
                    </h2>
                    <Reveal as="ul" className={style.branches}>
                        {branches.map((b) => (
                            <li key={b._id}>
                                <Link
                                    href={{ pathname: '/bookRoom', query: { branch: b._id } }}
                                    className={style.branch}
                                >
                                    <span className={style.branchName}>{b.name}</span>
                                    <span className={style.branchAddr}>{b.address}</span>
                                    <span className={style.branchCta}>Xem phòng trống</span>
                                </Link>
                            </li>
                        ))}
                    </Reveal>
                </section>
            )}

            <div className={clsx(style.stickyCta, !heroSeen && style.show)}>
                <Button href="#search-ticket" size="lg" block>
                    Tìm phòng trống
                </Button>
            </div>
        </>
    );
};

export default Home;
