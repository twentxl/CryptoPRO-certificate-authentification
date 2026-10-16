export interface Certificate {
    IssuerName?: string;
    SubjectName?: string;
    SerialNumber?: string;
    ValidFromDate?: string;
    ValidToDate?: string;
    IsValid: boolean;
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