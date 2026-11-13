import Image from 'next/image';
import clsx from 'clsx';
import styles from './Checkout.module.scss';

/** Chọn phim (không bắt buộc): "Để sau" hoặc một poster. */
const FilmPicker = ({ films, value, onChange }) => (
    <div role="radiogroup" aria-label="Phim muốn xem" className={styles.films}>
        <button
            type="button"
            role="radio"
            aria-checked={!value}
            className={clsx(styles.filmLater, !value && styles.checked)}
            onClick={() => onChange(undefined)}
        >
            Để sau
        </button>
        {films.map((film) => (
            <button
                key={film._id}
                type="button"
                role="radio"
                aria-checked={value === film._id}
                aria-label={film.name}
                className={clsx(styles.film, value === film._id && styles.checked)}
                onClick={() => onChange(film._id)}
            >
                <Image src={film.image} alt="" width={110} height={160} />
            </button>
        ))}
    </div>
);

export default FilmPicker;
