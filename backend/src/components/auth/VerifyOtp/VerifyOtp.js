// components/common/OtpVerification.js
import React, { useRef, useEffect, useState } from 'react';
import styles from './VerifyOtp.module.scss';
import clsx from 'clsx';
import Button from '@/components/common/Button/Button';
import { resetPassword, resendOtp } from '@/services/auth';
import { toast } from 'react-toastify';

const OtpVerification = ({ email, otp, setOtp, onVerify }) => {
    const [timeLeft, setTimeLeft] = useState(60); // 5 phút = 300 giây
    const [isResendEnabled, setIsResendEnabled] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsResendEnabled(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleResend = async () => {
        if (isResendEnabled) {
            alert('Đã gửi lại OTP!');
            setTimeLeft(60); // Reset lại 5 phút
            setIsResendEnabled(false);

            try {
                const response = await resendOtp(email);
                if (response.success) {
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').trim();
        if (!/^\d+$/.test(paste)) return;

        const pasteArray = paste.split('').slice(0, otp.length);
        const newOtp = [...otp];
        pasteArray.forEach((char, index) => {
            newOtp[index] = char;
        });
        setOtp(newOtp);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString();
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className={styles.otpContainer}>
            <p className={styles.title}>Xác nhận OTP</p>
            <div className={styles.otp}>
                {otp.map((value, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={value}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className={styles.otpInput}
                    />
                ))}
            </div>
            <div
                className={clsx(styles.resendotp, isResendEnabled && styles.resendEnabled)}
                onClick={isResendEnabled ? handleResend : undefined}
            >
                {isResendEnabled ? 'Gửi lại OTP' : `(${formatTime(timeLeft)}) Gửi lại OTP`}
            </div>
            <Button rounded_20 yellowLinear onClick={onVerify}>
                Xác nhận
            </Button>
        </div>
    );
};

export default OtpVerification;
