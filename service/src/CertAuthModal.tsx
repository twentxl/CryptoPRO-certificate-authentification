import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./CertAuthModal.module.css";
import { useCertificate } from "./hooks/useCertificate";
import type { User } from "./types/models";
import { parseDnToUser } from "./lib/parseDn";
import Modal from "./components/Modal/Modal";
import Button from "./components/Button/Button";
import { getSelectedCertificateBase64 } from "./api/certificate_api";
import { auth_challenge, auth_login, signChallengeBySerial } from "./api/authentification_api";
import { app_url } from "./urls";
import CertInfoModal from "./CertInfoModal";

const INITIAL_PERCENTS: [number, number, number] = [40, 30, 30];
const MIN_W = 120;

export default function CertAuthModal(){
  const certificates = useCertificate();

  // список сертификатов
  const rows: User[] = useMemo(() => {
    if (!certificates) return [];
    
    return certificates.map((c) => {
      const user = parseDnToUser(c.SubjectName);
      const issuer = parseDnToUser(c.IssuerName);
      return {
        userName: user?.userName,
        org: issuer?.org,
        serialNumber: c.SerialNumber,
      };
    });
  }, [certificates]);

  const [infoOpen, setInfoOpen] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedRow = rows[selectedIndex];

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [colWidths, setColWidths] = useState<[number, number, number] | null>(null);

  // выбранный сертификат для информации
  const selectedCert = certificates?.[selectedIndex];

  // выбор и подпись сертификата
  const selectCertificateRow = async() => {
    if (!selectedRow) return;

    const certBase64 = await getSelectedCertificateBase64(selectedRow.serialNumber || undefined);
    if (!certBase64) return;

    const { challengeId, challengeBase64 } = await auth_challenge();
    const signatureBase64 = await signChallengeBySerial(challengeBase64, selectedRow.serialNumber);
    if (!signatureBase64 || !certBase64) return;

    const res = await auth_login({ challengeId, certificateBase64: certBase64, signatureBase64 });

    if (!res?.accessToken) throw new Error("Пустой токен");

    const returnUrl = new URLSearchParams(window.location.search).get("returnUrl") ?? app_url;

    window.location.href = `${returnUrl}?token=${encodeURIComponent(res.accessToken)}`;

    console.log("Сертификат прошел проверку!");
  }

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (!width) return;

      setColWidths((prev) => {
        if (prev) return prev;
        const px = INITIAL_PERCENTS.map((p) => Math.round((width * p) / 100)) as [
          number,
          number,
          number
        ];
        return px;
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dragRef = useRef<{
    colIndex: 0 | 1 | 2;
    startX: number;
    startWidth: number;
    pointerId: number;
  } | null>(null);

  // функция "отмены"
  const cancel = () => {
    const returnUrl = new URLSearchParams(window.location.search).get("returnUrl") ?? app_url;
    window.location.href = `${returnUrl}?token=`;
  };

  // изменение ширины колонок
  const onResizePointerDown = (e: React.PointerEvent<HTMLSpanElement>, colIndex: 0 | 1 | 2) => {
    if (!colWidths) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLSpanElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      colIndex,
      startX: e.clientX,
      startWidth: colWidths[colIndex],
      pointerId: e.pointerId,
    };
  };

  const onResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !colWidths) return;

    const { colIndex, startX, startWidth } = dragRef.current;
    const dx = e.clientX - startX;
    const next = Math.max(MIN_W, startWidth + dx);

    setColWidths((prev) => {
      if (!prev) return prev;
      const copy: [number, number, number] = [...prev] as [number, number, number];
      copy[colIndex] = next;
      return copy;
    });
  };

  const onResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
  };

  return (
    <>
    <Modal
      title="Выберите сертификат"
      children={
        <div className={style.grid}>
          <div
            ref={viewportRef}
            className={style.viewport}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          >
            <table className={style.table}>
              {colWidths && (
                <colgroup>
                  <col style={{ width: colWidths[0] }} />
                  <col style={{ width: colWidths[1] }} />
                  <col style={{ width: colWidths[2] }} />
                </colgroup>
              )}

              <thead>
                <tr>
                  <th>
                    Субъект
                    <span
                      className={style.resizer}
                      onPointerDown={(e) => onResizePointerDown(e, 0)}
                    />
                  </th>
                  <th>
                    Издатель
                    <span
                      className={style.resizer}
                      onPointerDown={(e) => onResizePointerDown(e, 1)}
                    />
                  </th>
                  <th>
                    Серийный номер
                    <span
                      className={style.resizer}
                      onPointerDown={(e) => onResizePointerDown(e, 2)}
                    />
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.serialNumber}-${i}`}
                    className={i === selectedIndex ? style.selected : undefined}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <td title={r.userName}>{r.userName}</td>
                    <td title={r.org}>{r.org}</td>
                    <td title={r.serialNumber}>{r.serialNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
      footer={
        <>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button onClick={() => selectCertificateRow()}>Выбрать</Button>
            <Button variant="ghost" onClick={cancel}>Отмена</Button>
          </div>
          <Button variant="dark-ghost" onClick={() => setInfoOpen(true)}>Данные сертификата</Button>
        </>
      }
    />

    {/* модал информации о сертификате */}
    {infoOpen && (
      <CertInfoModal
        certificate={selectedCert}
        onClose={() => setInfoOpen(false)}
      />
    )}
    </>
  );
}