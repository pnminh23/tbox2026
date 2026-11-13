import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import style from './selection.module.scss';
import { useStyleClass } from '@/hooks/useStyleClass';
import { AiOutlineCheckCircle } from 'react-icons/ai';

const Selection = ({
    options = [],
    defaultValue = '--Tùy chọn--',
    onChange,
    className,
    multiple = false,
    optionLabel = 'name',
    optionValue = 'id',
    ...props
}) => {
    const getOptionValue = (option) => (typeof option === 'object' ? option[optionValue] : option);
    const getOptionLabel = (option) => (typeof option === 'object' ? option[optionLabel] : option);

    const [selected, setSelected] = useState(
        multiple ? (Array.isArray(defaultValue) ? defaultValue : []) : defaultValue
    );
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const styleClass = useStyleClass(props, style);

    const handleSelect = (option) => {
        const value = getOptionValue(option);
        if (multiple) {
            setSelected((prevSelected) => {
                const isSelected = prevSelected.includes(value);
                const newSelected = isSelected
                    ? prevSelected.filter((item) => item !== value)
                    : [...prevSelected, value];
                onChange?.(newSelected);
                return newSelected;
            });
        } else {
            setSelected(value);
            setIsOpen(false);
            onChange?.(value);
        }
    };

    const isSelected = (option) => {
        const value = getOptionValue(option);
        return multiple ? selected.includes(value) : selected === value;
    };

    const getLabelByValue = (value) => {
        const option = options.find((opt) => getOptionValue(opt) === value);
        return option ? getOptionLabel(option) : '--Tùy chọn--';
    };

    const displaySelected = multiple
        ? selected.length > 0
            ? selected.map(getLabelByValue).join(', ')
            : '--Tùy chọn--'
        : getLabelByValue(selected);

    // ✅ Reset khi defaultValue thay đổi
    useEffect(() => {
        const initial = multiple ? (Array.isArray(defaultValue) ? defaultValue : []) : defaultValue;
        setSelected(initial);
    }, [defaultValue, multiple]);

    return (
        <div ref={dropdownRef} className={clsx(styleClass, style.container, className)}>
            <div className={clsx(styleClass, style.select)} onClick={() => setIsOpen(!isOpen)}>
                {displaySelected}
            </div>
            {isOpen && (
                <ul className={clsx(styleClass, style.dropdown)}>
                    {options.length > 0 ? (
                        options.map((option) => {
                            const value = getOptionValue(option);
                            const label = getOptionLabel(option);
                            return (
                                <li
                                    key={value}
                                    className={clsx(
                                        styleClass,
                                        style.option,
                                        isSelected(option) && style.selectedOption
                                    )}
                                    onClick={() => handleSelect(option)}
                                >
                                    {label}
                                    {isSelected(option) && multiple && <AiOutlineCheckCircle color="#3772ff" />}
                                </li>
                            );
                        })
                    ) : (
                        <li className={clsx(styleClass, style.option, style.emptyOption)}>&nbsp;</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Selection;
