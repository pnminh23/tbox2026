import Image from 'next/image';
import Link from 'next/link';
import { PATH } from '@/constants/config';
import { durationMinutes } from '@/function/duration';
import { formatDuration } from '@/lib/booking.mjs';
import styles from './ListFilmPage.module.scss';

/** Thẻ phim: poster, thông tin, nút đặt phòng xem phim đó. */
const FilmCard = ({ film }) => {
    const minutes = durationMinutes(film.duration);
    const meta = [film.release_date, minutes ? formatDuration(minutes) : film.duration, film.country].filter(Boolean);

    return (
        <article className={styles.card}>
            <div className={styles.poster}>
                <Image src={film.image} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 240px" />
            </div>
            <div className={styles.body}>
                <h3>{film.name}</h3>
                {film.nameEnglish !== film.name && <p className={styles.en}>{film.nameEnglish}</p>}
                <p className={styles.meta}>{meta.join(', ')}</p>
                <ul className={styles.tags} aria-label="Thể loại">
                    {film.category?.map((c) => (
                        <li key={c}>{c}</li>
                    ))}
                </ul>
                <Link
                    href={{ pathname: PATH.BookRoom, query: { film: film._id } }}
                    className={styles.book}
                    aria-label={`Đặt phòng xem ${film.name}`}
                >
                    Đặt phòng xem phim này
                </Link>
            </div>
        </article>
    );
};

export default FilmCard;
