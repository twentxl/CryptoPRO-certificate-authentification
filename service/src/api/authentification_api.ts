import { api_url } from "../urls";

type ChallengeResponse = {
  challengeId: string;
  challengeBase64: string;
  expiresInSeconds: number;
};

type LoginRequest = {
  challengeId: string;
  certificateBase64: string;
  signatureBase64: string;
};

export const signChallengeBySerial = async (challengeBase64: string,serialNumber: string | undefined): Promise<string | undefined> => {
  try {
    if (!serialNumber) return undefined;

    await cadesplugin;
    const store = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
    await store.Open();
    const certs = await store.Certificates;

    const count = await certs.Count;

    let selectedCert: any = null;
    for (let i = count; i >= 1; i--) {
      const c = await certs.Item(i);
      if ((await c.SerialNumber) === serialNumber) {
        selectedCert = c;
        break;
      }
    }
    if (!selectedCert) return undefined;

    const signer = await cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
    await signer.propset_Certificate(selectedCert);

    const signedData = await cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
    await signedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
    await signedData.propset_Content(challengeBase64);

    const signatureBase64: string = await signedData.SignCades(
      signer,
      cadesplugin.CADESCOM_CADES_BES,
      false
    );

    return signatureBase64;
  } catch (error) {
    console.error("Ошибка подписи challenge: ", error);
    throw error;
  }
};

export const auth_challenge = async (): Promise<ChallengeResponse> => {
  const r = await fetch(`${api_url}Auth/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export const auth_login = async (payload: LoginRequest) => {
    try {
        const r = await fetch(`${api_url}Auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const text = await r.text();

        if (!r.ok) {
            throw new Error(text || `HTTP ${r.status}`);
        }

        if (!text) return null;

        return JSON.parse(text);
    } catch(error) {
        console.error(error);
        throw error;
    }
};