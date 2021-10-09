export interface MenuItem {
  label: string
  path: string
  class: string
  type: string // internal, external
}

export const MenuItems = [
  {
    label: 'Tokens',
    path: '/tokens',
    class: '',
    type: 'internal',
  },
  {
    label: 'Swap',
    path: 'https://app.behodler.io',
    class: '',
    type: 'external',
  },
  {
    label: 'Apps',
    path: 'https://app.behodler.io/apps',
    class: '',
    type: 'external',
  },
  {
    label: 'Governance',
    path: 'https://snapshot.behodler.io/#/',
    class: '',
    type: 'external',
  },
]
