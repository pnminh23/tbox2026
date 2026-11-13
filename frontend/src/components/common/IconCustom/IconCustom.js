import React from 'react';
import Tippy from '@tippyjs/react';
import styles from './IconCustom.module.scss';
import 'tippy.js/dist/tippy.css';
function IconCustom({
    icon: IconComponent,
    size = 24,
    className = '',
    style = {},
    href = '',
    onClick = null,
    tooltip = '',
    placement = 'top',
}) {
    const icon = (
        <IconComponent
            size={size}
            color={color}
            className={className}
            style={{
                cursor: onClick || href ? 'pointer' : undefined,
                ...style,
            }}
            onClick={onClick}
        />
    );

    const wrappedIcon = tooltip ? (
        <Tippy content={tooltip} placement={placement}>
            <span>{icon}</span>
        </Tippy>
    ) : (
        icon
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                {wrappedIcon}
            </a>
        );
    }

    return wrappedIcon;
}

export default IconCustom;
