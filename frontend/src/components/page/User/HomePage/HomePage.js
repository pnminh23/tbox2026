import style from "./HomePage.module.scss";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Slider from "@/components/common/Slider";
import FilmItem from "@/components/common/ItemSlider/FilmItem";
import Banner from "@/components/common/Banner";
import BoxItem from "@/components/common/ItemSlider/BoxItem";
import Button from "@/components/common/Button/Button";
import imgContent1 from "@public/static/img/imgContent1.webp";
import img2Content1 from "@public/static/img/img2Content1.jpg";
import { AiOutlineCheck, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import decorImg1 from "@public/static/img/decor/1.webp";
import decorImg2 from "@public/static/img/decor/2.webp";
import decorImg3 from "@public/static/img/decor/3.webp";
import decorImg4 from "@public/static/img/decor/4.webp";
import menu1 from "@public/static/img/menuItem/menu1.jpg";
import menu2 from "@public/static/img/menuItem/menu2.jpg";
import menu3 from "@public/static/img/menuItem/menu3.jpg";
import comboDat from "@public/static/img/menuItem/comboDating.jpg";
// import backgroundContent3 from "@public/static/img/menuItem/background.jpg";
import clsx from "clsx";
import { useRef, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Feedback from "@/components/common/Feedback";
import { useAllFilms, useFilmsByCurrentYear } from "@/services/films";
import { PATH } from "@/constants/config";
import { useAllBranches } from "@/services/branch";
import { useRoomByBranch } from "@/services/room";
import dynamic from "next/dynamic";

// Import tĩnh bị lỗi:
// import LoadingItem from '@/components/common/LoadingItem/LoadingItem';
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Thay thế bằng:
const DynamicLoadingItem = dynamic(
    () => import("@/components/common/LoadingItem/LoadingItem"),
    { ssr: false }
);
const Home = () => {
    // const { films, isLoadingAllFimls, isErrorAllFimls, mutateFilms } = useAllFilms();
    const { branches, isLoadingAllBranches } = useAllBranches();

    const [selectedBranch, setSelectedBranch] = useState("");
    const { roomsByBranch, isLoading: loadingRoom } =
        useRoomByBranch(selectedBranch);
    useEffect(() => {
        if (branches?.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0]._id);
        }
    }, [branches, selectedBranch]);

    const {
        filmsCurrentyear,
        isLoadingFilmsByCurrentYear,
        isErrorFilmsByCurrentYear,
        mutateFilmsByCurrentYear,
    } = useFilmsByCurrentYear();

    const top10RecentFilms = useMemo(() => {
        if (!filmsCurrentyear) return [];
        return [...filmsCurrentyear]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
    }, [filmsCurrentyear]);

    const prevRef = useRef(null);
    const nextRef = useRef(null);
    return (
        <div>
            <Banner />
            <div className="container">
                <Slider
                    // apiUrl="https://phimapi.com/v1/api/danh-sach/phim-le"
                    data={top10RecentFilms}
                    isLoading={isLoadingFilmsByCurrentYear}
                    title="Phim mới ra mắt"
                    slidesPerView={5}
                    renderItem={(film) => <FilmItem film={film} />}
                    breakpoints={{
                        0: { slidesPerView: 2 },
                        480: { slidesPerView: 3 },
                        980: { slidesPerView: 5 },
                    }}
                />

                <div className={style.roomByBranch}>
                    <select
                        className={style.select}
                        value={selectedBranch || ""}
                        onChange={(e) => setSelectedBranch(e.target.value)}>
                        {branches?.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                    {loadingRoom ? (
                        // Hiển thị một placeholder/skeleton loading rõ ràng
                        <div className={style.loadingPlaceholder}>
                            <DynamicLoadingItem />
                        </div>
                    ) : (
                        // Chỉ render Slider khi đã có dữ liệu cuối cùng
                        <Slider
                            key={selectedBranch}
                            data={roomsByBranch || []} // Truyền mảng rỗng nếu roomsByBranch là null/undefined
                            title="Hệ thống phòng"
                            slidesPerView={3}
                            renderItem={(box) => <BoxItem box={box} />}
                            autoplay={true}
                            slidesPerGroup={3}
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                480: { slidesPerView: 2 },
                                980: { slidesPerView: 3 },
                            }}
                        />
                    )}
                </div>
            </div>
            <div className={style.content1}>
                <h3> lí do chọn PNM - BOX</h3>
                {/* <Image src={bkg1} alt="background" /> */}
                <div className="container">
                    <div className={style.intro}>
                        <div className={style.paragraph}>
                            <h5>Cafe phim phòng riêng đầu tiên</h5>
                            <p>
                                Tự hào là một trong những thương hiệu tiên phong
                                cho mô hình cafe phim tại Việt Nam, PNM - BOX
                                mang đến một không gian giải trí riêng tư và độc
                                đáo. Nơi đây nhanh chóng trở thành điểm hẹn lý
                                tưởng cho các cặp đôi và nhóm bạn muốn tận hưởng
                                những giây phút thư giãn.
                                <br />
                                <br />
                                Tại PNM - BOX, mỗi &ldquo;box&rdquo; là một
                                phòng chiếu phim mini được trang bị màn hình lớn
                                sắc nét và hệ thống âm thanh sống động. Điểm
                                nhấn đặc biệt là bạn có thể vừa theo dõi các bộ
                                phim yêu thích, vừa thoải mái thưởng thức đồ
                                uống và món ăn nhẹ được phục vụ ngay tại phòng.
                                <br />
                                <br />
                                Với không gian ấm cúng, lãng mạn cùng chất lượng
                                dịch vụ chu đáo, PNM - BOX đã tạo nên một lựa
                                chọn giải trí hấp dẫn, kết hợp hoàn hảo trải
                                nghiệm xem phim chuyên nghiệp và sự thoải mái
                                của một quán cà phê.
                            </p>
                        </div>
                        <Image src={imgContent1} alt="image Box" />
                    </div>
                    <div className={style.utilities}>
                        <div className={style.image}>
                            <Image src={img2Content1} alt="ảnh nhân viên" />
                        </div>
                        <div className={style.contentUtilities}>
                            <ul>
                                <li>
                                    Thiết bị hiện đại <AiOutlineCheck />
                                </li>
                                <li>
                                    vệ sinh sạch sẽ <AiOutlineCheck />
                                </li>
                                <li>
                                    bảo mật riêng tư cam kết 100&percnt; ko
                                    camera
                                    <AiOutlineCheck />
                                </li>
                                <li>
                                    Tài khoản Youtube, Netflix, Fpt Play Prenium
                                    <AiOutlineCheck />
                                </li>
                                <li>
                                    Bảo đảm vệ sinh an toàn thực phẩm
                                    <AiOutlineCheck />
                                </li>
                                <li>
                                    Dành cho khách hàng trên 18 tuổi
                                    <AiOutlineCheck />
                                </li>
                            </ul>
                            <Button
                                uppercase
                                p_10_24
                                w_fit
                                rounded_10
                                redLinear
                                bold
                                href={PATH.BookRoom}>
                                Đặt phòng
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.content3}>
                <h5>Thực đơn đa dạng</h5>
                <div className={style.containerContent3}>
                    <div className="container">
                        <div className={style.menuitem}>
                            <Image src={menu1} alt="Menu 1" />
                            <Image src={menu2} alt="Menu 2" />
                            <Image src={menu3} alt="Menu 3" />
                            <Image src={menu3} alt="Menu 3" />
                            <div className={style.comboImage}>
                                <Image src={comboDat} alt="Combo dating" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className={style.title}>
                    <h1>Đánh giá của khách hàng về PNM - BOX</h1>
                </div>
                <Feedback />
            </div>
        </div>
    );
};
export default Home;
