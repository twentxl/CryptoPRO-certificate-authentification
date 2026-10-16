import React from "react";
import styles from './Button.module.css';

interface ButtonProps {
    style?: React.CSSProperties;
    variant?: string;
    children: React.ReactNode;
    name?: string;
    className?: string;
    id?: string;
    onClick?: () => void;
}
const Button: React.FC<ButtonProps> = ({ style, variant, children, name, id, className, onClick }) => {
    return (
        <button id={id} name={name} className={`${styles.button} ${className}`} style={style} data-variant={variant} onClick={onClick}>
            {children}
        </button>
    )
};

export default Button;