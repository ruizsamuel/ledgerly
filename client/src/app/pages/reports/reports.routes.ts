export const REPORTS_ROUTES = [
  {
    path: '',
    loadComponent: () => import('./reports.component').then(c => c.ReportsComponent)
  }
];
