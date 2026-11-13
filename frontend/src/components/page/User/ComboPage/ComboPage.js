import Banner from "@/components/common/Banner";
import style from "./ComboPage.module.scss";
import Title from "@/components/common/Title";
import Button from "@/components/common/Button";
import { PATH } from "@/constants/config";
import Image from "next/image";
import decorImg1 from "@public/static/img/decor/1.webp";
import decorImg2 from "@public/static/img/decor/2.webp";
import decorImg3 from "@public/static/img/decor/3.webp";
import decorImg4 from "@public/static/img/decor/4.webp";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useEffect, useRef, useState } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import Slider from "@/components/common/Slider";
import BoxItem from "@/components/common/ItemSlider/BoxItem";
import Feedback from "@/components/common/Feedback";
import { useAllCombo } from "@/services/combo";
import { formatMoney } from "@/function/formatMoney";
import { useRoomByBranch } from "@/services/room";
import { useAllBranches } from "@/services/branch";
import dynamic from "next/dynamic";

// Import tĩnh bị lỗi:
// import LoadingItem from '@/components/common/LoadingItem/LoadingItem';
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Thay thế bằng:
const DynamicLoadingItem = dynamic(
    () => import("@/components/common/LoadingItem/LoadingItem"),
    { ssr: false }
);

const ComboPage = () => {
    const {
        allCombo,
        isLoading: loadingAllCombo,
        error: erroAllCombo,
    } = useAllCombo();
    const { branches, isLoadingAllBranches } = useAllBranches();

    const [selectedBranch, setSelectedBranch] = useState("");
    const { roomsByBranch, isLoading: loadingRoom } =
        useRoomByBranch(selectedBranch);
    useEffect(() => {
        if (branches?.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0]._id);
        }
    }, [branches, selectedBranch]);
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    return (
        <>
            <Banner />
            <div className="container">
                <Title>Combo đặt phòng</Title>
                <div className={style.listCombo}>
                    {allCombo?.map((combo) => {
                        const arrayDescription = combo?.description
                            .split(".") // 1. Tách chuỗi thành mảng các phần tử, mỗi phần tử là đoạn text trước dấu chấm
                            .map((item) => item.trim()) // 2. Duyệt từng phần tử, loại bỏ khoảng trắng đầu và cuối (dùng trim)
                            .filter((item) => item.length > 0); // 3. Loại bỏ những phần tử rỗng (nếu có phần tử nào chỉ chứa khoảng trắng hoặc rỗng)

                        return (
                            <div className={style.combo} key={combo._id}>
                                <div className={style.title}>{combo.name}</div>
                                <div className={style.utility}>
                                    {arrayDescription.map((item, index) => (
                                        <p key={index}>{item}</p>
                                    ))}
                                </div>
                                <div className={style.price}>
                                    {combo.types.map((type) => (
                                        <div
                                            className={style.item}
                                            key={type.typeRoom._id}>
                                            <p
                                                className={
                                                    style.nameCombo
                                                }>{`Box ${type.typeRoom.name}`}</p>
                                            <p>{formatMoney(type.price)}</p>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    yellowLinear
                                    rounded_10
                                    href={PATH.BookRoom}>
                                    Đặt phòng ngay
                                </Button>
                            </div>
                        );
                    })}
                </div>
                <div className={style.comboDecorate}>
                    <h1 className={style.titleDecerate}>Combo trang trí</h1>
                    <p className={style.params}>
                        PNM - BOX mang đến combo khuyến mãi hấp dẫn trong không
                        gian riêng tư và ấm cúng. Các phòng được trang trí theo
                        từng chủ đề và được thay đổi phù hợp với các dịp đặc
                        biệt như Valentine, Noel hay sinh nhật. Ánh đèn nhẹ
                        nhàng, decor tinh tế tạo nên khung cảnh lý tưởng cho
                        những buổi hẹn hò hay kỷ niệm đáng nhớ. Đặt phòng để tận
                        hưởng trọn vẹn cảm giác riêng tư và lãng mạn nhé!
                    </p>
                    <div className={style.slider}>
                        <div ref={prevRef} className={style.prevButton}>
                            <AiOutlineLeft />
                        </div>
                        <div ref={nextRef} className={style.nextButton}>
                            <AiOutlineRight />
                        </div>

                        <Swiper
                            className={style.swiperContent}
                            modules={[Navigation, Autoplay]}
                            speed={700}
                            slidesPerView={3}
                            loop={true}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            onInit={(swiper) => {
                                swiper.params.navigation.prevEl =
                                    prevRef.current;
                                swiper.params.navigation.nextEl =
                                    nextRef.current;
                                swiper.navigation.init();
                                swiper.navigation.update();
                            }}
                            breakpoints={{
                                0: { slidesPerView: 1, spaceBetween: 10 },
                                480: { slidesPerView: 2, spaceBetween: 15 },
                                980: { slidesPerView: 3, spaceBetween: 30 },
                            }}>
                            <SwiperSlide className={style.item}>
                                <Image src={decorImg1} alt="decor Image" />
                            </SwiperSlide>
                            <SwiperSlide className={style.item}>
                                <Image src={decorImg2} alt="decor Image" />
                            </SwiperSlide>
                            <SwiperSlide className={style.item}>
                                <Image src={decorImg3} alt="decor Image" />
                            </SwiperSlide>
                            <SwiperSlide className={style.item}>
                                <Image src={decorImg4} alt="decor Image" />
                            </SwiperSlide>
                        </Swiper>
                    </div>
                    <Button yellowLinear rounded_10 className={style.button}>
                        Liên hệ với PNM - BOX
                    </Button>
                </div>
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
                <Feedback />
            </div>
        </>
    );
};
export default ComboPage;
