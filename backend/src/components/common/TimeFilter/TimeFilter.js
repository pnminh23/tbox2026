import { useState, useEffect, useRef } from 'react';
import styles from './TimeFilter.module.scss';

import dayjs from 'dayjs';
import { FaCalendarAlt } from 'react-icons/fa';
import Calendar from '../Calender';

const filterOptions = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Hôm qua', value: 'yesterday' },
    { label: 'Tuần này', value: 'this_week' },
    { label: 'Tháng này', value: 'this_month' },
    { label: 'Tháng trước', value: 'last_month' },
    { label: 'Năm nay', value: 'this_year' },
    { label: 'Năm trước', value: 'last_year' },
];

const TimeFilter = ({ onFilterChange }) => {
    const [activeFilter, setActiveFilter] = useState('this_week');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // State cho khoảng ngày đã được áp dụng
    const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
    // State cho khoảng ngày đang được chọn tạm thời trong popover
    const [tempDateRange, setTempDateRange] = useState([null, null]);

    const popoverRef = useRef(null);

    // Đóng popover khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Xử lý khi chọn các bộ lọc có sẵn
    const handleFilterClick = (filterValue) => {
        setActiveFilter(filterValue);
        setAppliedDateRange([null, null]); // Reset khoảng ngày tùy chỉnh đã áp dụng
        setIsPopoverOpen(false);
        if (onFilterChange) {
            onFilterChange({ filter: filterValue, range: null });
        }
    };

    // Mở popover và đồng bộ state tạm thời với state đã áp dụng
    const handleCustomButtonClick = () => {
        setTempDateRange(appliedDateRange);
        setIsPopoverOpen(true);
    };

    // Thay đổi ngày tạm thời trong popover
    const handlePopoverDateChange = (date, type) => {
        const newRange = [...tempDateRange];
        if (type === 'start') {
            newRange[0] = date;
            // Nếu ngày bắt đầu mới sau ngày kết thúc cũ, đặt lại ngày kết thúc
            if (newRange[1] && dayjs(newRange[0]).isAfter(dayjs(newRange[1]))) {
                newRange[1] = null;
            }
        } else {
            newRange[1] = date;
        }
        setTempDateRange(newRange);
    };

    // Nút "Đặt lại" trong popover
    const handleReset = () => {
        setTempDateRange([null, null]);
    };

    // Nút "Áp dụng" trong popover
    const handleApply = () => {
        setAppliedDateRange(tempDateRange);
        setActiveFilter('custom');
        if (onFilterChange) {
            onFilterChange({
                filter: 'custom',
                range: { startDate: tempDateRange[0], endDate: tempDateRange[1] },
            });
        }
        setIsPopoverOpen(false);
    };

    const [tempStartDate, tempEndDate] = tempDateRange;
    const [appliedStartDate, appliedEndDate] = appliedDateRange;

    // Hiển thị text cho nút Tùy chỉnh
    const customButtonText =
        activeFilter === 'custom' && appliedStartDate && appliedEndDate
            ? `${dayjs(appliedStartDate).format('DD/MM/YY')} - ${dayjs(appliedEndDate).format('DD/MM/YY')}`
            : 'Tùy chỉnh';

    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        className={`${styles.filterButton} ${activeFilter === option.value ? styles.active : ''}`}
                        onClick={() => handleFilterClick(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className={styles.customFilterWrapper} ref={popoverRef}>
                <button
                    className={`${styles.filterButton} ${activeFilter === 'custom' ? styles.active : ''}`}
                    onClick={handleCustomButtonClick}
                >
                    {customButtonText}
                </button>

                {isPopoverOpen && (
                    <div className={styles.popover}>
                        <div className={styles.popoverHeader}>Chọn khoảng ngày</div>
                        <div className={styles.popoverBody}>
                            <div className={styles.datePickerGroup}>
                                <label>Từ ngày</label>
                                <Calendar
                                    selectedDate={tempStartDate}
                                    onChange={(date) => handlePopoverDateChange(date, 'start')}
                                />
                            </div>
                            <div className={styles.datePickerGroup}>
                                <label>Đến ngày</label>
                                <Calendar
                                    selectedDate={tempEndDate}
                                    onChange={(date) => handlePopoverDateChange(date, 'end')}
                                    minDate={tempStartDate} // Không cho phép chọn ngày kết thúc trước ngày bắt đầu
                                />
                            </div>
                        </div>
                        <div className={styles.popoverFooter}>
                            <button className={styles.resetButton} onClick={handleReset}>
                                Đặt lại
                            </button>
                            <button
                                className={styles.applyButton}
                                onClick={handleApply}
                                disabled={!tempStartDate || !tempEndDate} // Vô hiệu hóa nếu chưa chọn đủ ngày
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeFilter;
