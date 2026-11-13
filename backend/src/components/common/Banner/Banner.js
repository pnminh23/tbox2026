import style from './Banner.module.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import Image from 'next/image';
import banerSrc1 from '../../../../public/static/img/banner/banner1.jpg';
import banerSrc2 from '../../../../public/static/img/banner/banner2.jpg';
import banerSrc3 from '../../../../public/static/img/banner/banner3.jpg';
const Banner = () => {
    return (
        <div className={style.banner}>
            <Swiper
                modules={[Navigation, Autoplay]}
                speed={1000}
                slidesPerView={1}
                autoplay={{ delay: 5000 }}
                loop={true}
                // grabCursor={true}s
                draggable={true}
                navigation={{
                    prevEl: `.${style.prevButton}`,
                    nextEl: `.${style.nextButton}`,
                }}
            >
                <div className={style.prevButton}>
                    <AiOutlineLeft />
                </div>
                <div className={style.nextButton}>
                    <AiOutlineRight />
                </div>

                <SwiperSlide>
                    <Image src={banerSrc1} alt="banner" />
                </SwiperSlide>
                <SwiperSlide>
                    <Image src={banerSrc2} alt="banner" />
                </SwiperSlide>
                <SwiperSlide>
                    <Image src={banerSrc3} alt="banner" />
                </SwiperSlide>
            </Swiper>
        </div>
    );
};
export default Banner;
