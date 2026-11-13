import Button from '@/components/common/Button';
import styles from './Overview.module.scss';
import {
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlineHourglass,
} from 'react-icons/ai';
import iconRoom from '@public/static/img/Group_1000006539.svg';
import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ListInvoice from '@/components/common/ListInvoice';
import { useAllBookingByEmailCurrent, useBookingStatsByEmail } from '@/services/booking';
import dayjs from 'dayjs';

const OverviewPage = () => {
    const { booking: allBookingCurrent } = useAllBookingByEmailCurrent();
    const { booking: bookingStats } = useBookingStatsByEmail();

    console.log('allBookingCurrent: ', allBookingCurrent);
    console.log('bookingStats: ', bookingStats);

    return (
        <div className={styles.container}>
            <div className={styles.statistics}>
                <h1>Thống kê đơn đặt phòng</h1>
                <div className={styles.groupBoxes}>
                    <div className={styles.boxItem}>
                        <AiOutlineHourglass />
                        <p>Số đơn hôm nay</p>
                        <p className={styles.number}>{bookingStats?.totalBookingsToday}</p>
                    </div>
                    <div className={styles.boxItem}>
                        <AiOutlineCheckCircle />
                        <p>Số đơn đã hoàn thành</p>
                        <p className={styles.number}>{bookingStats?.completedBookingsToday}</p>
                    </div>
                    <div className={styles.boxItem}>
                        <AiOutlineCloseCircle />
                        <p>Số đơn đã hủy </p>
                        <p className={styles.number}>{bookingStats?.cancelledBookingsToday}</p>
                    </div>
                </div>
            </div>

            <div className={styles.listInvoiceContainer}>
                <h1>Đơn đặt phòng hôm nay</h1>

                {allBookingCurrent?.map((booking) => (
                    <ListInvoice key={booking._id} booking={booking} />
                ))}
            </div>
        </div>
    );
};
export default OverviewPage;
