import Image from 'next/image';
import { Button, PageIntro, Reveal, Skeleton } from '@/components/ui';
import { useAllBranches } from '@/services/branch';
import { formatMoney } from '@/function/formatMoney';
import { PATH } from '@/constants/config';
import style from './LocationsPage.module.scss';

const LocationsPage = () => {
    const { branches, isLoading } = useAllBranches();

    return (
        <>
            <PageIntro
                title="Hệ thống cơ sở"
                lead="Mỗi cơ sở có nhiều phòng Standard và VIP. Giá tính theo thời gian dùng phòng."
            />
            <div className={style.list}>
                {isLoading && <Skeleton h={320} radius={18} />}
                {branches?.length === 0 && <p className={style.muted}>Chưa có cơ sở nào.</p>}
                {branches?.map((branch) => (
                    <section key={branch._id} className={style.branch} aria-labelledby={`branch-${branch._id}`}>
                        <div className={style.info}>
                            <h2 id={`branch-${branch._id}`}>{branch.name}</h2>
                            <p>{branch.address}</p>
                            <a href={`tel:${branch.phone}`} className={style.phone}>
                                {branch.phone}
                            </a>
                            <ul className={style.prices} aria-label="Giá phòng">
                                {branch.typeRoom?.map((type) => (
                                    <li key={type._id}>
                                        <span>{type.name}</span>
                                        <strong>{formatMoney(type.base_price_per_minute * 60)} một giờ</strong>
                                    </li>
                                ))}
                            </ul>
                            <Button href={{ pathname: PATH.BookRoom, query: { branch: branch._id } }}>
                                Xem phòng trống
                            </Button>
                        </div>
                        <Reveal as="ul" className={style.rooms} stagger={40} aria-label={`Phòng tại ${branch.name}`}>
                            {branch.rooms?.map((room) => (
                                <li key={room._id} className={style.room}>
                                    <Image src={room.image} alt="" fill sizes="(max-width: 768px) 60vw, 20vw" />
                                    <span>
                                        Phòng {room.name}, {room.type?.name}
                                    </span>
                                </li>
                            ))}
                        </Reveal>
                    </section>
                ))}
            </div>
        </>
    );
};

export default LocationsPage;
