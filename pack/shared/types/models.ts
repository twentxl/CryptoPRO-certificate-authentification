export interface Certificate {
    issuerName?: string;
    subjectName?: string;
    serialNumber?: string;
    validFromDate?: string;
    validToDate?: string;
    isValid: boolean;
}

export interface UserPermissions {
  canDispnTFOMS: boolean;
  canDispnSMO: boolean;
  canDispnMO: boolean;
}

export interface User {
  userName?: string;
  userEmail?: string;
  serialNumber?: string;
  org?: string;
  country?: string;
  region?: string;
  validFrom?: string;
  validTo?: string;
}