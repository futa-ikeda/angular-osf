import { WorkflowLauncherCard, WorkflowLauncherCardTheme } from '../models/workflow-launcher-card.model';

export const WORKFLOW_LAUNCHER_CARDS: WorkflowLauncherCard[] = [
  {
    iconClass: 'custom-icon-registries',
    titleKey: 'home.loggedIn.dashboard.workflowLauncher.cards.studyPlans.title',
    descriptionKey: 'home.loggedIn.dashboard.workflowLauncher.cards.studyPlans.description',
    buttonLabelKey: 'home.loggedIn.dashboard.workflowLauncher.cards.studyPlans.button',
    theme: WorkflowLauncherCardTheme.Blue,
    routerLink: '/registries/osf/new',
  },
  {
    iconClass: 'custom-icon-projects',
    titleKey: 'home.loggedIn.dashboard.workflowLauncher.cards.researchMaterials.title',
    descriptionKey: 'home.loggedIn.dashboard.workflowLauncher.cards.researchMaterials.description',
    buttonLabelKey: 'home.loggedIn.dashboard.workflowLauncher.cards.researchMaterials.button',
    theme: WorkflowLauncherCardTheme.Teal,
    routerLink: '/choose-repository',
  },
  {
    iconClass: 'custom-icon-preprints',
    titleKey: 'home.loggedIn.dashboard.workflowLauncher.cards.preprints.title',
    descriptionKey: 'home.loggedIn.dashboard.workflowLauncher.cards.preprints.description',
    buttonLabelKey: 'home.loggedIn.dashboard.workflowLauncher.cards.preprints.button',
    theme: WorkflowLauncherCardTheme.TealGreen,
    routerLink: '/preprints/select',
  },
  {
    iconClass: 'fas fa-magnifying-glass',
    titleKey: 'home.loggedIn.dashboard.workflowLauncher.cards.search.title',
    descriptionKey: 'home.loggedIn.dashboard.workflowLauncher.cards.search.description',
    buttonLabelKey: 'home.loggedIn.dashboard.workflowLauncher.cards.search.button',
    theme: WorkflowLauncherCardTheme.Green,
    routerLink: '/search',
  },
];
