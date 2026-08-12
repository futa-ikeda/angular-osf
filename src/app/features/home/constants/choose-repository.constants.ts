import { RepositoryOption } from '../models/choose-repository.model';

export const REPOSITORY_OPTIONS: RepositoryOption[] = [
  {
    id: 'zenodo',
    titleKey: 'chooseRepository.repositories.zenodo.title',
    logoUrl: 'assets/images/repositories/zenodo_logo.png',
    descriptionKey: 'chooseRepository.repositories.zenodo.description',
    linkTextKey: 'chooseRepository.repositories.zenodo.linkText',
    linkUrl: 'https://zenodo.org/',
  },
  {
    id: 'dryad',
    titleKey: 'chooseRepository.repositories.dryad.title',
    logoUrl: 'assets/images/repositories/dryad_logo.png',
    descriptionKey: 'chooseRepository.repositories.dryad.description',
    linkTextKey: 'chooseRepository.repositories.dryad.linkText',
    linkUrl: 'https://datadryad.org/',
  },
  {
    id: 'figshare',
    titleKey: 'chooseRepository.repositories.figshare.title',
    logoUrl: 'assets/images/repositories/figshare_logo.png',
    descriptionKey: 'chooseRepository.repositories.figshare.description',
    linkTextKey: 'chooseRepository.repositories.figshare.linkText',
    linkUrl: 'https://figshare.com/',
  },
  {
    id: 'harvardDataverse',
    titleKey: 'chooseRepository.repositories.harvardDataverse.title',
    logoUrl: 'assets/images/repositories/dataverse_logo.png',
    descriptionKey: 'chooseRepository.repositories.harvardDataverse.description',
    linkTextKey: 'chooseRepository.repositories.harvardDataverse.linkText',
    linkUrl: 'https://dataverse.harvard.edu/',
  },
  {
    id: 'mendeleyData',
    titleKey: 'chooseRepository.repositories.mendeleyData.title',
    logoUrl: 'assets/images/repositories/mendeley_logo.png',
    descriptionKey: 'chooseRepository.repositories.mendeleyData.description',
    linkTextKey: 'chooseRepository.repositories.mendeleyData.linkText',
    linkUrl: 'https://data.mendeley.com/',
  },
  {
    id: 'vivli',
    titleKey: 'chooseRepository.repositories.vivli.title',
    logoUrl: 'assets/images/repositories/vivli_logo.png',
    descriptionKey: 'chooseRepository.repositories.vivli.description',
    linkTextKey: 'chooseRepository.repositories.vivli.linkText',
    linkUrl: 'https://vivli.org/',
  },
];
