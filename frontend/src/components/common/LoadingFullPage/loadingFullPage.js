import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import style from './loadingFullPage.module.scss';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const LoadingFullPage = () => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        const fetchAnimation = async () => {
            const res = await fetch('/animations/LoadingFullPage.json'); // Load từ `public/`
            const data = await res.json();
            setAnimationData(data);
        };
        fetchAnimation();
    }, []);

    if (!animationData) return <p>Loading...</p>;

    return (
        <div className={style.loadingContainer}>
            <Lottie animationData={animationData} loop={true} className={style.lottieAnimation} />
        </div>
    );
};

export default LoadingFullPage;
