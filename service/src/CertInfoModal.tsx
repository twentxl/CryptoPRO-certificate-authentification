import React, { useMemo, useRef, useState } from "react";
import Modal from "./components/Modal/Modal";
import Button from "./components/Button/Button";
import style from "./CertInfoModal.module.css";
import type { Certificate } from "./types/models";
import { parseDnToUser } from "./lib/parseDn";

type Props = {
  certificate: Certificate | null | undefined;
  onClose: () => void;
};

type Tab = "general" | "composition";

const MIN_W = 120;

export default function CertInfoModal({ certificate, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("general");

  // ширины колонок для "Состав"
  const [leftColWidth, setLeftColWidth] = useState<number>(220);

  const dragRef = useRef<{
    startX: number;
    startWidth: number;
    pointerId: number;
  } | null>(null);

  const onResizePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLSpanElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      startX: e.clientX,
      startWidth: leftColWidth,
      pointerId: e.pointerId,
    };
  };

  const onResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    const dx = e.clientX - dragRef.current.startX;
    const nextLeft = Math.max(MIN_W, dragRef.current.startWidth + dx);

    setLeftColWidth(nextLeft);
  };

  const onResizePointerUp = () => {
    dragRef.current = null;
  };

  const general = useMemo(() => {
    if (!certificate) return null;

    const subj = parseDnToUser(certificate.SubjectName);
    const issuer = parseDnToUser(certificate.IssuerName);

    const validFrom = certificate.ValidFromDate ?? "";
    const validTo = certificate.ValidToDate ?? "";

    return {
      toWhom: subj?.userName ?? certificate.SubjectName ?? "",
      issuedBy: issuer?.org ?? certificate.IssuerName ?? "",
      validText: validFrom && validTo ? `Действителен с ${validFrom} по ${validTo}` : "",
    };
  }, [certificate]);

  const compositionRows = useMemo(() => {
    if (!certificate) return [];

    return [
      { field: "Кому выдан", value: certificate.SubjectName ?? "" },
      { field: "Кем выдан", value: certificate.IssuerName ?? "" },
      { field: "Серийный номер", value: certificate.SerialNumber ?? "" },
      { field: "Действителен с", value: certificate.ValidFromDate ?? "" },
      { field: "Действителен по", value: certificate.ValidToDate ?? "" },
      { field: "Действителен сейчас", value: certificate.IsValid ? "Да" : "Нет" },
    ];
  }, [certificate]);

  return (
    <Modal
      title="Данные сертификата"
      children={
        <div className={style.root}>
          <div className={style.tabs}>
            <button
              className={tab === "general" ? style.tabActive : style.tab}
              onClick={() => setTab("general")}
              type="button"
            >
              Общие
            </button>

            <button
              className={tab === "composition" ? style.tabActive : style.tab}
              onClick={() => setTab("composition")}
              type="button"
            >
              Состав
            </button>
          </div>

          <div className={style.body}>
            {tab === "general" && (
              <div className={style.general}>
                <div className={style.generalBox}>
                  <div className={style.generalRow}>
                    <div className={style.label}>Кому выдан:</div>
                    <div className={style.value}>{general?.toWhom ?? ""}</div>
                  </div>

                  <div className={style.generalRow}>
                    <div className={style.label}>Кем выдан:</div>
                    <div className={style.value}>{general?.issuedBy ?? ""}</div>
                  </div>

                  <div className={style.generalRow}>
                    <div className={style.label}> </div>
                    <div className={style.value}>{general?.validText ?? ""}</div>
                  </div>
                </div>
              </div>
            )}

            {tab === "composition" && (
              <div
                className={style.grid}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
                onPointerCancel={onResizePointerUp}
              >
                <div className={style.viewport}>
                  <table className={style.table}>
                    <colgroup>
                        <col style={{ width: leftColWidth }} />
                        <col />
                    </colgroup>

                    <thead>
                      <tr>
                        <th style={{ position: "relative" }}>
                          Поле
                          <span className={style.resizer} onPointerDown={onResizePointerDown} />
                        </th>
                        <th>Значение</th>
                      </tr>
                    </thead>

                    <tbody>
                      {compositionRows.map((r, i) => (
                        <tr key={i}>
                          <td title={r.field}>{r.field}</td>
                          <td title={r.value}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      footer={
        <Button variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
      }
    />
  );
}