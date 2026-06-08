// Define routes and navigation structure

export const routes = {
  home: '/',
  signIn: '/sign-in',

  transactions: '/transactions',
  customers: '/customers',
  paymentMethods: '/payment-methods',
  developers: '/developers',

  preferences: '/preferences',
  dev: '/dev/primitives',
  table: '/dev/table',
  forms: '/dev/forms',
};

export interface SideNavItem {
  href: string;
  label: string;
  icon: string;
  children?: SideNavItem[];
}

// Payments assignment navigation.
export const SIDENAV: SideNavItem[] = [
  {
    href: routes.home,
    label: 'overview',
    icon: 'LayoutDashboard',
  },
  {
    href: routes.transactions,
    label: 'transactions',
    icon: 'ReceiptText',
  },
  {
    href: routes.customers,
    label: 'customers',
    icon: 'Users',
  },
  {
    href: routes.paymentMethods,
    label: 'paymentMethods',
    icon: 'CreditCard',
  },
  {
    href: routes.preferences,
    label: 'preferences',
    icon: 'Settings',
  },
  {
    href: routes.developers,
    label: 'developers',
    icon: 'Code2',
    children: [
      {
        href: routes.dev,
        label: 'primitives',
        icon: 'Palette',
      },
      {
        href: routes.table,
        label: 'table',
        icon: 'Table',
      },
      {
        href: routes.forms,
        label: 'forms',
        icon: 'Type',
      },
    ],
  },
];
