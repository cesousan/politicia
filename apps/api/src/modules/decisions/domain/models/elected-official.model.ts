import { Opaque } from '../../../../shared/types/opaque.type';

export type ElectedOfficialId = Opaque<string, 'ElectedOfficialId'>;

export interface SocialMedia {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  socialMedia?: SocialMedia;
}

export interface ElectedOfficial {
  id: ElectedOfficialId;
  firstName: string;
  lastName: string;
  party: string;
  partyId?: string;
  position: string;
  region: string;
  constituency?: string;
  mandateStart?: Date;
  mandateEnd?: Date | null;
  assemblyId?: string;
  bio?: string;
  imageUrl?: string;
  contactInfo: ContactInfo;
}

export interface ElectedOfficialFilters {
  assemblyId?: string;
  party?: string;
  position?: string;
  region?: string;
  searchTerm?: string;
}
