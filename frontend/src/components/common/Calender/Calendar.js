import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import style from './Calendar.module.scss';
import { useStyleClass } from '@/hooks/useStyleClass';
import clsx from 'clsx';

const Calendar = ({
    selectedDate,
    onChange,
    currentDay = false,
    type = 'day',
    disabled = false,
    disablePastDates = false,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const styleClass = useStyleClass(props, style);

    useEffect(() => {
        if (currentDay && !selectedDate) {
            const today = new Date();
            onChange(today);
        }
    }, [currentDay, selectedDate, onChange]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const formattedDate = selectedDate
        ? type === 'month'
            ? `${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`
            : selectedDate.toLocaleDateString('vi-VN') // Dùng định dạng Việt Nam
        : type === 'month'
        ? 'Chọn tháng'
        : 'Chọn ngày';

    return (
        <div className={clsx(style.calendarWrapper, styleClass)} ref={wrapperRef}>
            <div
                className={clsx(style.calendarButton, disabled && style.disable, styleClass)}
                onClick={() => !disabled && setOpen(!open)}
            >
                {formattedDate}
                <CalendarIcon className={style.calendarIcon} />
            </div>
            {open && !disabled && (
                <div className={style.calendarPopover}>
                    <DatePicker
                        key={type}
                        selected={selectedDate}
                        onChange={(newDate) => {
                            onChange(newDate);
                            setOpen(false);
                        }}
                        inline
                        showMonthYearPicker={type === 'month'}
                        dateFormat={type === 'month' ? 'MM/yyyy' : 'dd/MM/yyyy'}
                        className={style.customDatepicker}
                        minDate={disablePastDates ? new Date() : null}
                    />
                </div>
            )}
        </div>
    );
};

export default Calendar;
