import {
  ElectedOfficial,
  ElectedOfficialId,
} from '../../modules/decisions/domain/models/elected-official.model';

export const mockElectedOfficials = {
  official1: {
    id: 'official-1' as ElectedOfficialId,
    firstName: 'Jane',
    lastName: 'Smith',
    party: 'Progressive Party',
    position: 'Senator',
    region: 'North',
    bio: 'Jane Smith is a dedicated public servant with 10 years of experience.',
    imageUrl: 'https://example.com/officials/jane-smith.jpg',
    contactInfo: {
      email: 'jane.smith@assembly.gov',
      phone: '+1-202-555-0101',
      website: 'https://janesmith.gov',
      socialMedia: {
        twitter: '@janesmith',
        facebook: 'janemsmith',
      },
    },
  },
  official2: {
    id: 'official-2' as ElectedOfficialId,
    firstName: 'John',
    lastName: 'Doe',
    party: 'Conservative Alliance',
    position: 'Representative',
    region: 'South',
    bio: 'John Doe has served his community for over 15 years in various roles.',
    imageUrl: 'https://example.com/officials/john-doe.jpg',
    contactInfo: {
      email: 'john.doe@assembly.gov',
      phone: '+1-202-555-0102',
      website: 'https://johndoe.gov',
      socialMedia: {
        twitter: '@johndoe',
        facebook: 'johndoeofficial',
      },
    },
  },
  official3: {
    id: 'official-3' as ElectedOfficialId,
    firstName: 'Maria',
    lastName: 'Rodriguez',
    party: 'Independent',
    position: 'Senator',
    region: 'West',
    bio: 'Maria Rodriguez is known for her bipartisan approach to legislation.',
    imageUrl: 'https://example.com/officials/maria-rodriguez.jpg',
    contactInfo: {
      email: 'maria.rodriguez@assembly.gov',
      phone: '+1-202-555-0103',
      website: 'https://mariarodriguez.gov',
      socialMedia: {
        twitter: '@mariarodriguez',
        facebook: 'mariarodriguezofficial',
      },
    },
  },
};

/**
 * Returns a copy of the test elected officials
 */
export function getTestElectedOfficials(): ElectedOfficial[] {
  return Object.values(mockElectedOfficials).map((official) => ({
    ...official,
  }));
}

/**
 * Creates a test elected official with optional overrides
 */
export function createTestElectedOfficial(
  overrides?: Partial<ElectedOfficial>
): ElectedOfficial {
  return {
    ...mockElectedOfficials.official1,
    id: `official-${Date.now()}` as ElectedOfficialId,
    ...overrides,
  };
}
