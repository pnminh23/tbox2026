// components/RoomDisplay.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './RoomDisplay.module.scss'; // Import CSS Module
import Image from 'next/image';
import box from '@public/static/icons/box.svg';

const RoomDisplay = ({ roomType, roomName }) => {
    // Bạn có thể tạo một class động dựa trên roomType nếu muốn có style riêng biệt
    // Ví dụ: const iconClassName = `${styles.icon} ${styles['icon' + roomType]}`;
    // và sau đó sử dụng iconClassName cho div icon.
    // Điều này yêu cầu bạn định nghĩa các class .iconJ, .iconQ, .iconK trong file .scss

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <Image src={box} alt="box" width={70} height={70} />
                <div className={styles.roomType}>{roomType}</div>
            </div>

            <div className={styles.roomName}>
                {`${roomType} - ${roomName}`} {/* Hoặc chỉ {roomName} */}
            </div>
        </div>
    );
};

export default RoomDisplay;
