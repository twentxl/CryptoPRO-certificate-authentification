import React from "react";
import style from "./Modal.module.css";
import logo from "../../img/logo.png";

interface ModalProps {
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ title, children, footer }) => {

  return (
    <div className={style.wrapper}>
      <div className={style.overlay}></div>

      <div className={style.modal}>

        <div className={style.logo}>
          <img src={logo} alt="ТФОМС логотип аутентификации" />
        </div>

        <div className={style.modalHeader}>
          <h4>{title}</h4>
        </div>

        <div className={style.modalContent}>
            {children}
        </div>

        <div className={style.modalButtons}>
          {footer}
        </div>

      </div>
    </div>
  );
};

export default Modal;