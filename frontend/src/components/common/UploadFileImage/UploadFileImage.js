import { useEffect, useRef, useState } from 'react';
import styles from './UploadFileImage.module.scss';
import Button from '@/components/common/Button';
import { AiOutlineUpload, AiOutlineClose } from 'react-icons/ai';
import noImage from '@public/static/img/avatar/no_image.jpg'; // Đảm bảo đường dẫn này chính xác
import Image from 'next/image';
import { useStyleClass } from '@/hooks/useStyleClass';
import clsx from 'clsx';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
// const MAX_SIZE_BYTES = 5 * 1024 * 1024; // Ví dụ: 5MB

const UploadFileImage = ({ defaultImage, onFileSelected, ...props }) => {
    const styleClass = useStyleClass(props, styles);
    // noImage.src sẽ được dùng nếu noImage là một đối tượng StaticImageData từ import
    const [imageUrl, setImageUrl] = useState(
        defaultImage && defaultImage.trim() ? defaultImage : noImage.src || noImage
    );
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef(null);

    // 1. Cập nhật imageUrl khi defaultImage prop thay đổi
    useEffect(() => {
        const newUrlToSet = defaultImage && defaultImage.trim() ? defaultImage : noImage.src || noImage;
        setImageUrl((currentStoredUrl) => {
            // Nếu URL hiện tại là một blob và nó sẽ bị thay thế bởi defaultImage mới,
            // thì revoke blob URL cũ đó.
            if (
                typeof currentStoredUrl === 'string' &&
                currentStoredUrl.startsWith('blob:') &&
                currentStoredUrl !== newUrlToSet
            ) {
                URL.revokeObjectURL(currentStoredUrl);
            }
            return newUrlToSet;
        });
    }, [defaultImage]);

    // 2. Quản lý bộ nhớ (revoke object URL) khi imageUrl thay đổi hoặc component unmount
    useEffect(() => {
        // Biến này giữ giá trị imageUrl của lần render mà effect này được chạy
        const imageUrlToCleanUp = imageUrl;

        // Hàm cleanup này sẽ chạy:
        // - Khi component unmount.
        // - Hoặc trước khi effect này chạy lại (do imageUrl thay đổi).
        // Nó sẽ revoke imageUrlToCleanUp (tức là imageUrl của lần render trước đó).
        return () => {
            if (typeof imageUrlToCleanUp === 'string' && imageUrlToCleanUp.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrlToCleanUp);
            }
        };
    }, [imageUrl]); // Chạy lại effect (và cleanup trước đó) khi imageUrl thay đổi

    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (fileInputRef.current) {
            // Reset input để có thể chọn lại cùng file nếu cần
            fileInputRef.current.value = '';
        }

        if (file) {
            // 5. Kiểm tra định dạng file cơ bản phía client
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert(
                    `Loại file không hợp lệ. Chỉ chấp nhận: ${ALLOWED_TYPES.map((type) => type.split('/')[1])
                        .join(', ')
                        .toUpperCase()}`
                );
                return;
            }
            // if (file.size > MAX_SIZE_BYTES) {
            //     alert(`Kích thước file quá lớn. Tối đa: ${MAX_SIZE_BYTES / (1024 * 1024)}MB`);
            //     return;
            // }

            // Không cần revoke ở đây nữa vì useEffect với dependency [imageUrl] sẽ xử lý việc revoke URL cũ
            // khi imageUrl được set thành URL mới.

            const previewUrl = URL.createObjectURL(file);
            setImageUrl(previewUrl); // Điều này sẽ trigger useEffect ở trên để cleanup URL cũ (nếu có)
            onFileSelected?.(file);
        }
    };

    const handleImageClick = () => {
        if (imageUrl !== (noImage.src || noImage)) {
            setShowPreview(true);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
    };

    // 4. Xử lý lỗi tải ảnh (cho ảnh chính)
    const handleImageError = () => {
        // Tránh vòng lặp vô hạn nếu noImage cũng bị lỗi
        if (imageUrl !== (noImage.src || noImage)) {
            setImageUrl(noImage.src || noImage);
        }
    };

    return (
        <>
            <div className={clsx(styles.container)}>
                <Image
                    src={imageUrl}
                    alt="Xem trước ảnh đã chọn" // 3. Cải thiện alt text
                    width={150}
                    height={150}
                    className={clsx(styleClass, styles.img)}
                    unoptimized // Giữ lại nếu ảnh là từ người dùng hoặc URL ngoài
                    onClick={handleImageClick}
                    onError={handleImageError} // 4. Xử lý lỗi tải ảnh
                    style={{ cursor: imageUrl !== (noImage.src || noImage) ? 'pointer' : 'default' }}
                />
                <div className={styles.uploadImage}>
                    <p>Kích thước tối thiểu 300 x 300 pixel</p>
                    <p className={styles.subText}>Hỗ trợ: JPG, JPEG, PNG</p>
                    <input
                        type="file"
                        accept={ALLOWED_TYPES.join(',')} // Thêm accept để browser filter
                        className={styles.fileInput}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        light
                        w_fit
                        outline
                        rounded_10
                        icon={<AiOutlineUpload />}
                        onClick={handleFileInputClick}
                        className={styles.btn}
                    >
                        Chọn ảnh
                    </Button>
                </div>
            </div>

            {showPreview && (
                <div className={styles.modalOverlay} onClick={handleClosePreview}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={handleClosePreview}>
                            <AiOutlineClose size={20} />
                        </button>
                        <Image
                            src={imageUrl} // imageUrl ở đây đã được xác thực hoặc là noImage
                            alt="Xem trước chi tiết ảnh" // 3. Cải thiện alt text
                            layout="intrinsic"
                            width={0} // Next.js sẽ tự điều chỉnh với layout intrinsic
                            height={0}
                            sizes="100vw"
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                height: 'auto',
                                width: 'auto',
                                objectFit: 'contain',
                            }}
                            unoptimized
                            // onError cho modal preview ít quan trọng hơn nếu ảnh thumbnail đã load được
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default UploadFileImage;
