import { FEATURE_FLAGS } from '@osf/shared/constants/feature-flags.const';
import { UserDataJsonApi, UserDataResponseJsonApi } from '@osf/shared/models/user/user-json-api.model';

const userDataJsonApi: UserDataJsonApi = {
  id: '1',
  type: 'users',
  attributes: {
    accepted_terms_of_service: false,
    active: true,
    allow_indexing: true,
    can_view_reviews: true,
    date_registered: '2024-01-01',
    education: [
      {
        degree: 'Bachelor of Science',
        institution: 'University of Technology',
        startYear: 2016,
        startMonth: 1,
        endYear: 2020,
        endMonth: 1,
        ongoing: false,
        department: 'Computer Science',
      },
    ],
    employment: [
      {
        title: 'Software Engineer',
        institution: 'Tech Corp',
        startYear: 2020,
        startMonth: 1,
        endYear: null,
        endMonth: null,
        ongoing: true,
        department: 'Engineering',
      },
    ],
    family_name: 'Doe',
    full_name: 'John Doe',
    given_name: 'John',
    middle_names: '',
    suffix: '',
    locale: 'en_US',
    social: {
      ssrn: '',
      orcid: '0000-0000-0000-0000',
      github: ['https://github.com/johndoe'],
      scholar: '',
      twitter: ['https://twitter.com/johndoe'],
      linkedIn: ['https://linkedin.com/in/johndoe'],
      impactStory: '',
      baiduScholar: '',
      researchGate: '',
      researcherId: '',
      profileWebsites: ['https://example.com/profile'],
      academiaProfileID: '',
      academiaInstitution: '',
    },
    external_identity: {},
    timezone: 'Etc/UTC',
  },
  relationships: {
    default_region: {
      data: {
        id: 'us',
        type: 'regions',
      },
    },
  },
  links: {
    html: 'https://example.com/profile',
    iri: 'https://example.com/profile',
    profile_image: 'https://example.com/profile.png',
    self: 'https://api.test/v2/users/1/',
  },
};

const currentUserResponse: UserDataResponseJsonApi = {
  meta: {
    active_flags: [FEATURE_FLAGS.WORKFLOW_LAUNCHER],
    current_user: { data: userDataJsonApi },
  },
};

const loggedOutUserResponse: UserDataResponseJsonApi = {
  meta: {
    active_flags: [],
    current_user: { data: null },
  },
};

export function getCurrentUserData(): UserDataResponseJsonApi {
  return structuredClone(currentUserResponse);
}

export function getLoggedOutCurrentUserData(): UserDataResponseJsonApi {
  return structuredClone(loggedOutUserResponse);
}

export function getUserDataJsonApi(): UserDataJsonApi {
  return structuredClone(userDataJsonApi);
}

export function getAcceptedTermsUserDataJsonApi(): UserDataJsonApi {
  return structuredClone({
    ...userDataJsonApi,
    attributes: {
      ...userDataJsonApi.attributes,
      accepted_terms_of_service: true,
    },
  });
}
