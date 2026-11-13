// components/Tabs/Tabs.jsx
import { useState } from 'react';
import styles from './Tabs.module.scss';

const Tabs = ({ tabs }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabHeaders}>
                {tabs?.map((tab, index) => (
                    <button
                        key={index}
                        className={`${styles.tabButton} ${activeIndex === index ? styles.active : ''}`}
                        onClick={() => setActiveIndex(index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className={styles.tabContent}>{tabs?.[activeIndex]?.content || null}</div>
        </div>
    );
};

export default Tabs;
