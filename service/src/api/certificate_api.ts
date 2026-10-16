import type { Certificate, User } from "../types/models";
import { parseDnToUser } from "../lib/parseDn";

const getStoreCertificates = async() => {
    await cadesplugin;
    const store = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
    await store.Open();
    return await store.Certificates;
}

export const getAllCertificates = async(): Promise<Certificate[]> => {
    try {
        const certs = await getStoreCertificates();
        const count = await certs.Count;

        let certList: Certificate[] = [];

        for (let i = count; i >= 1; i--) {
            const c = await certs.Item(i);
            const certIsValid: boolean = await c.IsValid();

            certList.push({
                IssuerName: c.IssuerName,
                SubjectName: c.SubjectName,
                SerialNumber: c.SerialNumber,
                ValidFromDate: c.ValidFromDate,
                ValidToDate: c.ValidToDate,
                IsValid: certIsValid,
            });
        }

        return certList;
    } catch(error) {
        console.error("Ошибка: ", error);
        throw error;
    }
}

export const getSelectedCertificateBase64 = async (serialNumber: string | undefined): Promise<string | undefined> => {
    if (!serialNumber) return undefined;

    const certs = await getStoreCertificates();
    const count = await certs.Count;

    for (let i = count; i >= 1; i--) {
        const c = await certs.Item(i);

        if ((await c.SerialNumber) === serialNumber) {
            const base64: string = await c.Export(0);
            return base64;
        }
    }

    return undefined;
};

export const getSelectedCertificate = async(serialNumber: string | undefined): Promise<Certificate | undefined> => {
    try {
        if (serialNumber == undefined) {
            return undefined;
        }

        const certs = await getStoreCertificates();
        const count = await certs.Count;

        for (let i = count; i >= 1; i--) {
            const c = await certs.Item(i);
            const certIsValid: boolean = await c.IsValid();

            if (await c.SerialNumber == serialNumber) {
                return {
                    IssuerName: await c.IssuerName,
                    SubjectName: await c.SubjectName,
                    SerialNumber: await c.SerialNumber,
                    ValidFromDate: await c.ValidFromDate,
                    ValidToDate: await c.ValidToDate,
                    IsValid: await certIsValid
                };
            }
        }

        return undefined;
    } catch(error) {
        console.error("Ошибка: ", error);
        throw error;
    }
}

export const certificateUserInfo = async(certificate: Certificate | undefined): Promise<User | undefined> => {
    try {
        if (certificate == undefined) {
            return undefined;
        }

        const user = parseDnToUser(certificate.SubjectName);

        return {
            userName: user?.userName,
            userEmail: user?.userEmail,
            serialNumber: certificate.SerialNumber,
            org: user?.org,
            country: user?.country,
            region: user?.region,
            validFrom: certificate.ValidFromDate,
            validTo: certificate.ValidToDate
        }
    } catch(error) {
        console.error(error);
        throw error;
    }
}