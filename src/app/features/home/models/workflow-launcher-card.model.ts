export enum WorkflowLauncherCardTheme {
  Blue = 'blue',
  Teal = 'teal',
  TealGreen = 'teal-green',
  Green = 'green',
}

export interface WorkflowLauncherCard {
  iconClass: string;
  titleKey: string;
  descriptionKey: string;
  buttonLabelKey: string;
  theme: WorkflowLauncherCardTheme;
  routerLink: string;
}
