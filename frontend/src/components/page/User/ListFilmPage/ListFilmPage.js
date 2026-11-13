import Slider from "@/components/common/Slider";
import style from "./ListFilmPage.module.scss";
import { useState, useRef, useEffect } from "react";
import { AiOutlineSearch, AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import FilmItem from "@/components/common/ItemSlider/FilmItem";
import Banner from "@/components/common/Banner";
import clsx from "clsx";
import SearchBar from "@/components/common/SearchBar";
import loadingAnimation from "@public/animations/loadingItem.json";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import {
    categoryFilms,
    useAllFilms,
    useFilm,
    useFilmsByCategory,
    useFilmsByCurrentYear,
    useFilmsByYear,
    useTop10Film,
} from "@/services/films";
import Pagination from "@/components/common/Pagonation";
import Button from "@/components/common/Button";

const ListFilmPage = () => {
    // --- State cho việc chọn filter ---
    const [selectedFilmId, setSelectedFilmId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [activeFilter, setActiveFilter] = useState(""); // 'search', 'category', 'year', 'top10'

    // --- Các hook fetch data gốc ---
    const { film: filmById, isLoading: loadingFilmById } =
        useFilm(selectedFilmId);
    const { film: filmByCategory, isLoading: loadingFilmByCategory } =
        useFilmsByCategory(selectedCategory);
    const { film: filmByYear, isLoading: loadingFilmByYear } =
        useFilmsByYear(selectedYear);
    const { film: top10Film, isLoading: loadingTop10Film } = useTop10Film();
    const { filmsCurrentyear, isLoadingFilmsByCurrentYear } =
        useFilmsByCurrentYear();
    const { films, isLoadingFilms, isErrorFilms } = useAllFilms();

    // --- STATE CHUNG ĐỂ HIỂN THỊ (Đây là phần quan trọng nhất) ---
    const [displayFilms, setDisplayFilms] = useState([]);
    const [displayTitle, setDisplayTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- Logic phân trang cho danh sách mặc định ---
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(8);
    const totalItems = films?.length || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedFilms =
        films?.slice((currentPage - 1) * limit, currentPage * limit) || [];
    const FilmOptions = films?.map((film) => ({
        name: `${film.name} - ${film.nameEnglish}`,
        id: film._id,
        image: film.image,
    }));

    // --- useEffects để cập nhật STATE CHUNG dựa trên filter đang active ---

    // 1. Lắng nghe filter THEO SEARCH
    useEffect(() => {
        if (activeFilter === "search") {
            setIsLoading(loadingFilmById);
            if (!loadingFilmById && filmById) {
                setDisplayFilms([filmById]); // filmById là 1 object, cần cho vào mảng
                setDisplayTitle("Phim bạn tìm kiếm");
            }
        }
    }, [activeFilter, filmById, loadingFilmById]);

    // 2. Lắng nghe filter THEO THỂ LOẠI
    useEffect(() => {
        if (activeFilter === "category") {
            setIsLoading(loadingFilmByCategory);
            if (!loadingFilmByCategory && filmByCategory) {
                setDisplayFilms(filmByCategory);
                setDisplayTitle(`Thể loại: ${selectedCategory}`);
            }
        }
    }, [activeFilter, filmByCategory, loadingFilmByCategory, selectedCategory]);

    // 3. Lắng nghe filter THEO NĂM
    useEffect(() => {
        if (activeFilter === "year") {
            setIsLoading(loadingFilmByYear);
            if (!loadingFilmByYear && filmByYear) {
                setDisplayFilms(filmByYear);
                setDisplayTitle(`Phim phát hành năm ${selectedYear}`);
            }
        }
    }, [activeFilter, filmByYear, loadingFilmByYear, selectedYear]);

    // 4. Lắng nghe filter TOP 10
    useEffect(() => {
        if (activeFilter === "top10") {
            setIsLoading(loadingTop10Film);
            if (!loadingTop10Film && top10Film) {
                setDisplayFilms(top10Film);
                setDisplayTitle("Top 10 phim được đặt nhiều nhất");
            }
        }
    }, [activeFilter, top10Film, loadingTop10Film]);

    const uniqueYears = films
        ? [...new Set(films.map((film) => film.release_date))].sort(
              (a, b) => b - a
          ) // Sắp xếp giảm dần (năm mới nhất lên đầu)
        : [];

    const clearAllFilters = () => {
        setSelectedFilmId(null);
        setSelectedCategory("");
        setSelectedYear("");
        setActiveFilter("");
        setDisplayFilms([]); // Xóa dữ liệu hiển thị filter
        setDisplayTitle("");
    };

    // Biến kiểm tra xem có đang filter hay không
    const isFiltering = !!activeFilter;

    return (
        <>
            <Banner />
            <div className={clsx("container", style.container)}>
                <div className={style.left}>
                    {/* ---- KHỐI RENDER TẬP TRUNG ---- */}
                    {isFiltering ? (
                        isLoading ? (
                            <div className={style.loadingContainer}>
                                <Lottie
                                    animationData={loadingAnimation}
                                    loop
                                    autoplay
                                    className={style.loading}
                                />
                                <p>Đang tìm kiếm...</p>
                            </div>
                        ) : displayFilms.length > 0 ? (
                            <Slider
                                key={displayTitle} // Dùng key để Slider reset hoàn toàn khi đổi filter
                                data={displayFilms}
                                title={displayTitle}
                                slidesPerView={4}
                                renderItem={(film) => <FilmItem film={film} />}
                            />
                        ) : (
                            <div className={style.noResult}>
                                <p>
                                    Không tìm thấy phim phù hợp với lựa chọn của
                                    bạn.
                                </p>
                            </div>
                        )
                    ) : (
                        // Giao diện mặc định khi không filter
                        <>
                            <Slider
                                data={filmsCurrentyear}
                                isLoading={isLoadingFilmsByCurrentYear}
                                title="Phim mới ra mắt năm nay"
                                slidesPerView={4}
                                renderItem={(film) => <FilmItem film={film} />}
                            />
                            <div className={style.allFimContainer}>
                                <div className={style.title}>
                                    <h3>Tất cả các Phim tại PNM - BOX</h3>
                                </div>
                                <div className={style.allFilm}>
                                    {isLoadingFilms ? (
                                        <p>Đang tải phim...</p>
                                    ) : isErrorFilms ? (
                                        <p>Lỗi khi tải phim.</p>
                                    ) : (
                                        paginatedFilms.map((film, index) => (
                                            <FilmItem key={index} film={film} />
                                        ))
                                    )}
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    limit={limit}
                                    onPageChange={setCurrentPage}
                                    onLimitChange={(newLimit) => {
                                        setLimit(newLimit);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className={style.right}>
                    {/* Phần filter không thay đổi nhiều, chỉ cần cập nhật tên state */}
                    <SearchBar
                        data={FilmOptions}
                        onSelect={(item) => {
                            setActiveFilter("search");
                            setSelectedFilmId(item.id);
                        }}
                        heightImage={70}
                        widthImage={50}
                    />
                    <ul className={clsx(style.options)}>
                        <li
                            className={clsx(
                                activeFilter === "top10" && style.active
                            )}
                            onClick={() => setActiveFilter("top10")}>
                            <AiOutlineRight />
                            Hot và phổ biến
                        </li>
                    </ul>
                    <div className={style.category}>
                        <h5>Thể loại</h5>
                        <ul>
                            {categoryFilms.map((category, index) => (
                                <li
                                    key={index}
                                    className={clsx(
                                        activeFilter === "category" &&
                                            selectedCategory === category &&
                                            style.active
                                    )}
                                    onClick={() => {
                                        setActiveFilter("category");
                                        setSelectedCategory(category);
                                    }}>
                                    <AiOutlineRight />
                                    {category}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={style.year}>
                        <h5>Năm phát hành</h5>
                        <ul>
                            {uniqueYears.map((year) => (
                                <div
                                    key={year}
                                    className={clsx(
                                        style.yearItem, // Class gốc
                                        activeFilter === "year" &&
                                            selectedYear === year &&
                                            style.active
                                    )}
                                    onClick={() => {
                                        setActiveFilter("year");
                                        setSelectedYear(year);
                                    }}>
                                    <p>{year}</p>
                                </div>
                            ))}
                        </ul>
                    </div>
                    <Button
                        className={style.btnFilter}
                        w_fit
                        grey={!!activeFilter}
                        disabled={!activeFilter}
                        rounded_10
                        h30
                        onClick={clearAllFilters}>
                        Xoá bộ lọc
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ListFilmPage;
