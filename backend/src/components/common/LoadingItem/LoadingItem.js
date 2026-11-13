import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import style from './Loading.module.scss';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const LoadingItem = () => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        const fetchAnimation = async () => {
            try {
                const res = await fetch('/animations/loadingItem.json');
                console.log('Fetch status:', res.status); // 👈
                const data = await res.json();
                console.log('Lottie data:', data); // 👈
                setAnimationData(data);
            } catch (err) {
                console.error('Failed to load animation', err); // 👈
            }
        };
        fetchAnimation();
    }, []);
    console.log('animation', animationData);

    if (!animationData) return <p>Loading...</p>;

    return (
        <div className={style.loadingContainer}>
            <Lottie animationData={animationData} loop={true} autoplay={true} />
        </div>
    );
};

export default LoadingItem;
