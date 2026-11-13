import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import {
    AiOutlineLeft,
    AiOutlineRight,
    AiOutlineDoubleRight,
} from "react-icons/ai";
import style from "./Slider.module.scss";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Title from "../Title";
import { PATH } from "@/constants/config";
import dynamic from "next/dynamic";

// Import tĩnh bị lỗi:
// import LoadingItem from '@/components/common/LoadingItem/LoadingItem';
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Thay thế bằng:
const DynamicLoadingItem = dynamic(
    () => import("@/components/common/LoadingItem/LoadingItem"),
    { ssr: false }
);

const Slider = ({
    data = [],
    isLoading,
    renderItem,
    title = "Slider",
    subtitle,
    slidesPerView,
    autoplay = false,
    slidesPerGroup = 1,
    breakpoints,
    children,
}) => {
    // const [items, setItems] = useState([]);
    // const [loading, setLoading] = useState(true);
    const swiperRef = useRef(null); // Ref cho Swiper
    const prevButtonRef = useRef(null);
    const nextButtonRef = useRef(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch(apiUrl);
    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }
    //             const result = await response.json();
    //             console.log('API Response:', result);

    //             if (result.status === 'success' && result.data && result.data.items) {
    //                 setItems(result.data.items);
    //             } else {
    //                 console.error('Dữ liệu API không hợp lệ');
    //             }
    //         } catch (error) {
    //             console.error('Lỗi khi fetch dữ liệu:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, [apiUrl]);

    useEffect(() => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.params.navigation.prevEl =
                prevButtonRef.current;
            swiperRef.current.swiper.params.navigation.nextEl =
                nextButtonRef.current;
            swiperRef.current.swiper.navigation.init();
            swiperRef.current.swiper.navigation.update();
            swiperRef.current.swiper.update();
        }
    }, [data]); // Chỉ chạy khi items được tải xong

    return (
        <div className={style.sliderContainer}>
            <div className={style.sliderTop}>
                <div className={style.navLeft}>
                    <Title>{title}</Title>
                </div>
                <div>{subtitle}</div>
                <div className={style.navRight}>
                    <div ref={prevButtonRef} className={clsx(style.prevButton)}>
                        <AiOutlineLeft />
                    </div>
                    <div ref={nextButtonRef} className={clsx(style.nextButton)}>
                        <AiOutlineRight />
                    </div>
                </div>
            </div>
            {children}
            <Swiper
                ref={swiperRef}
                className={style.swiperSlider}
                modules={[Navigation, Autoplay]}
                speed={1000}
                slidesPerView={slidesPerView}
                loop={true}
                slidesPerGroup={slidesPerGroup}
                draggable={true}
                navigation={{
                    prevEl: prevButtonRef.current,
                    nextEl: nextButtonRef.current,
                }}
                observer={true} // Thêm dòng này
                observeParents={true} // Thêm dòng này
                autoplay={
                    autoplay
                        ? { delay: 7000, disableOnInteraction: false }
                        : false
                }
                breakpoints={breakpoints}>
                {isLoading
                    ? Array.from({ length: slidesPerView }).map((_, index) => (
                          <SwiperSlide key={index}>
                              <DynamicLoadingItem />
                          </SwiperSlide>
                      ))
                    : // <p>loading</p>
                      data.map((item, index) => (
                          <SwiperSlide key={index}>
                              {renderItem(item)}
                          </SwiperSlide>
                      ))}
            </Swiper>
        </div>
    );
};

export default Slider;
