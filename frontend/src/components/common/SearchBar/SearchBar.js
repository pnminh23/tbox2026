import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.scss';
import Image from 'next/image';
import clsx from 'clsx';
import { AiOutlineSearch } from 'react-icons/ai';

const SearchBar = ({ data = [], onSelect, heightImage, widthImage, defaultValue = '' }) => {
    const [query, setQuery] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // useEffect này chịu trách nhiệm chuyển đổi defaultValue (id) thành tên hiển thị.
    // CHỈ CHẠY KHI DEFAULTVALUE HOẶC DATA THAY ĐỔI.
    useEffect(() => {
        const foundItem = data.find((item) => item.id === defaultValue);

        if (foundItem) {
            setQuery(foundItem.name);
            setFiltered([foundItem]); // Có thể muốn hiển thị item này trong dropdown nếu mở
            // Quan trọng: Không tự động mở dropdown ở đây, hãy để tương tác người dùng quyết định.
        } else {
            // Nếu defaultValue không có hoặc không tìm thấy, reset
            setQuery('');
            setFiltered([]);
        }
        // Luôn đóng dropdown khi defaultValue thay đổi (đảm bảo không còn hiển thị từ lần trước)
        setShowDropdown(false);
    }, [defaultValue, data]);

    // Lọc dữ liệu khi người dùng nhập vào input (query thay đổi)
    // useEffect này chỉ để cập nhật filtered dựa trên query, không quản lý showDropdown trực tiếp.
    useEffect(() => {
        const q = query.trim().toLowerCase();

        if (q === '') {
            setFiltered([]);
            // Nếu query rỗng, ta có thể đóng dropdown nếu nó đang mở
            // Trừ khi người dùng đang giữ focus và ta muốn hiển thị gợi ý trống (không khuyến khích)
        } else {
            const result = data.filter((item) => item.name.toLowerCase().includes(q));
            setFiltered(result);
        }
    }, [query, data]);

    // Ẩn dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setQuery(item.name); // Khi chọn, hiển thị tên trong input
        setShowDropdown(false); // Đóng dropdown sau khi chọn
        onSelect?.(item); // Gọi callback với toàn bộ item được chọn (bao gồm id, name, image)
    };

    return (
        <div ref={wrapperRef} className={styles.searchBarcontainer}>
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    // Khi người dùng gõ, luôn mở dropdown nếu có kết quả hoặc có thể có (query không rỗng)
                    if (e.target.value.trim() !== '') {
                        setShowDropdown(true);
                    } else {
                        setShowDropdown(false); // Đóng nếu xóa hết
                    }
                }}
                onFocus={() => {
                    // Khi input được focus, MỞ dropdown nếu có query hoặc có dữ liệu để gợi ý
                    if (query.trim() !== '' || data.length > 0) {
                        // Mở nếu có giá trị hoặc có data để gợi ý
                        setShowDropdown(true);
                    }
                }}
                className={clsx(styles.searchInp, showDropdown && styles.searchInpDropdown)}
            />
            <AiOutlineSearch className={styles.iconsearch} />
            {showDropdown && filtered.length > 0 && (
                <ul className={styles.dropdownContainer}>
                    {filtered.map((item) => (
                        <li key={item.id} onClick={() => handleSelect(item)} className={styles.resultItem}>
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    className={styles.img}
                                    width={widthImage}
                                    height={heightImage}
                                />
                            )}
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            )}
            {showDropdown && query !== '' && filtered.length === 0 && (
                <ul className={styles.dropdownContainer}>
                    <li className={styles.noResults}>Không tìm thấy kết quả phù hợp.</li>
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
