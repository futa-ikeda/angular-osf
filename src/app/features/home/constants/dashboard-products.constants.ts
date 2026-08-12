import { DashboardProductLink } from '../models/dashboard-product-link.model';

export const DASHBOARD_PRODUCT_LINKS: DashboardProductLink[] = [
  {
    link: 'https://www.cos.io/products/osf-collections',
    imageSrc: 'assets/images/dashboard/products/osf-collections.png',
    altKey: 'home.loggedIn.dashboard.images.osfCollectionsImageAltText',
    external: true,
    testId: 'products-collections',
  },
  {
    link: '/institutions',
    imageSrc: 'assets/images/dashboard/products/osf-institutions.png',
    altKey: 'home.loggedIn.dashboard.images.osfInstitutionsImageAltText',
  },
  {
    link: '/registries',
    imageSrc: 'assets/images/dashboard/products/osf-registries.png',
    altKey: 'home.loggedIn.dashboard.images.osfRegistriesImageAltTest',
  },
  {
    link: '/preprints',
    imageSrc: 'assets/images/dashboard/products/osf-preprints.png',
    altKey: 'home.loggedIn.dashboard.images.osfPreprintsImageAltTest',
  },
];
