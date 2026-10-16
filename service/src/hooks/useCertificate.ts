import { useState, useEffect } from 'react';
import type { Certificate } from '../types/models';
import { getAllCertificates } from '../api/certificate_api';

export const useCertificate = () => {
    const [certificates, setCertificates] = useState<Certificate[] | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            // получение сертификатов
            const raw = (await getAllCertificates()) as Certificate[];

            const normalized: Certificate[] = await Promise.all(
                raw.map(async (c) => ({
                IssuerName: await Promise.resolve(c.IssuerName),
                SubjectName: await Promise.resolve(c.SubjectName),
                SerialNumber: await Promise.resolve(c.SerialNumber),
                ValidFromDate: await Promise.resolve(c.ValidFromDate),
                ValidToDate: await Promise.resolve(c.ValidToDate),
                IsValid: await Promise.resolve(c.IsValid),
                }))
            );

            if (!cancelled) setCertificates(normalized);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return certificates;
}