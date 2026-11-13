import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button, PageIntro, Skeleton } from '@/components/ui';
import { categoryFilms, useAllFilms, useTop10Film } from '@/services/films';
import FilmCard from './FilmCard';
import style from './ListFilmPage.module.scss';

const PAGE = 12;
const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

const ListFilmPage = () => {
    const { films, isLoading: isLoadingFilms, isError: isErrorFilms } = useAllFilms();
    const { film: topFilms } = useTop10Film();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [year, setYear] = useState('');
    const [popular, setPopular] = useState(false);
    const [shown, setShown] = useState(PAGE);

    const years = useMemo(() => [...new Set((films || []).map((f) => f.release_date))].sort((a, b) => b - a), [films]);

    // Lọc trực tiếp khi render (không cần state trung gian)
    const list = useMemo(() => {
        const q = norm(query.trim());
        return (popular ? topFilms || [] : films || []).filter(
            (f) =>
                (!q || norm(`${f.name} ${f.nameEnglish}`).includes(q)) &&
                (!category || f.category?.some((c) => c.trim() === category.trim())) &&
                (!year || f.release_date === year),
        );
    }, [films, topFilms, popular, query, category, year]);

    const filtered = query || category || year || popular;
    const reset = () => {
        setQuery('');
        setCategory('');
        setYear('');
        setPopular(false);
        setShown(PAGE);
    };

    return (
        <>
            <PageIntro title="Phim" lead="Chọn phim bạn muốn xem rồi đặt phòng, hoặc để sau và chọn ngay tại phòng.">
                <form className={style.filters} role="search" onSubmit={(e) => e.preventDefault()}>
                    <label className={style.search}>
                        <span className="sr-only">Tìm phim</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => (setQuery(e.target.value), setShown(PAGE))}
                            placeholder="Tìm theo tên phim"
                        />
                    </label>
                    <label className={style.select}>
                        <span className="sr-only">Năm phát hành</span>
                        <select value={year} onChange={(e) => (setYear(e.target.value), setShown(PAGE))}>
                            <option value="">Mọi năm</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </label>
                </form>
                <div className={style.chips} role="group" aria-label="Lọc theo thể loại">
                    <button
                        type="button"
                        aria-pressed={popular}
                        className={clsx(style.chip, popular && style.active)}
                        onClick={() => (setPopular((v) => !v), setShown(PAGE))}
                    >
                        Được đặt nhiều
                    </button>
                    {categoryFilms.map((c) => (
                        <button
                            key={c}
                            type="button"
                            aria-pressed={category === c}
                            className={clsx(style.chip, category === c && style.active)}
                            onClick={() => (setCategory(category === c ? '' : c), setShown(PAGE))}
                        >
                            {c.trim()}
                        </button>
                    ))}
                </div>
            </PageIntro>

            <section className={style.section} aria-live="polite" aria-busy={isLoadingFilms || undefined}>
                {isErrorFilms && <p role="alert">Chưa tải được danh sách phim, bạn thử tải lại trang nhé.</p>}
                {isLoadingFilms && (
                    <div className={style.grid}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <Skeleton key={i} h={420} radius={14} />
                        ))}
                    </div>
                )}
                {!isLoadingFilms && films && !list.length && (
                    <div className={style.empty}>
                        <p>Không có phim nào khớp bộ lọc.</p>
                        <Button variant="outline" onClick={reset}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
                {list.length > 0 && (
                    <>
                        <p className={style.count}>
                            {list.length} phim{filtered ? ' khớp bộ lọc' : ''}
                        </p>
                        <div className={style.grid}>
                            {list.slice(0, shown).map((film) => (
                                <FilmCard key={film._id} film={film} />
                            ))}
                        </div>
                        {shown < list.length && (
                            <div className={style.more}>
                                <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
                                    Xem thêm phim
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </>
    );
};

export default ListFilmPage;
