export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    children: [
      {
        label: 'Solar',
        href: '/products/solar',
        children: [
          { label: 'CRB-S', href: '/products/solar/crb-s' },
          { label: 'EPB-S', href: '/products/solar/epb-s' },
          { label: 'DB 4-S', href: '/products/solar/db-4-s' },
          { label: 'ERH-S', href: '/products/solar/erh-s' },
          { label: 'FCH-S', href: '/products/solar/fch-s' },
          { label: 'Prototype Production', href: '/products/solar/prototype-production' },
        ],
      },
      {
        label: 'Automotive',
        href: '/products/automotive',
        children: [
          { label: 'DB 4', href: '/products/automotive/db-4' },
          { label: 'QS', href: '/products/automotive/qs' },
          { label: 'DB 4 Quick Change', href: '/products/automotive/db-4-quick-change' },
          { label: 'SDB-L', href: '/products/automotive/sdb-l' },
          { label: 'SDB-T', href: '/products/automotive/sdb-t' },
          { label: 'DBX-T', href: '/products/automotive/dbx-t' },
          { label: 'EPB-L/XL', href: '/products/automotive/epb-l-xl' },
          { label: 'EPB-XL', href: '/products/automotive/epb-xl' },
          { label: 'EPB-T/XT', href: '/products/automotive/epb-t-xt' },
          { label: 'CRB', href: '/products/automotive/crb' },
          { label: 'EPB-L/T', href: '/products/automotive/epb-l-t' },
          { label: 'EPB-LT', href: '/products/automotive/epb-lt' },
          { label: 'EPB-XLT', href: '/products/automotive/epb-xlt' },
        ],
      },
      {
        label: 'Architectural',
        href: '/products/architectural',
        children: [
          { label: 'ABTS', href: '/products/architectural/abts' },
          { label: 'FCH2', href: '/products/architectural/fch2' },
          { label: 'ERH2', href: '/products/architectural/erh2' },
          { label: 'TRCB', href: '/products/architectural/trcb' },
        ],
      },
      {
        label: 'Aftermarket',
        href: '/products/aftermarket',
        children: [
          { label: 'Retrofits', href: '/products/aftermarket/retrofits' },
          { label: 'Replacement Parts', href: '/products/aftermarket/replacement-parts' },
          { label: 'Service', href: '/products/aftermarket/service' },
          { label: 'Tooling', href: '/products/aftermarket/tooling' },
          { label: 'Shape Modeler', href: '/products/aftermarket/shape-modeler' },
          { label: 'Prototype Production', href: '/products/aftermarket/prototype-production' },
        ],
      },
      {
        label: 'Inspection',
        href: '/inspection',
        children: [
          { label: 'AGI-G/R™', href: '/inspection/agi-g-r' },
          { label: 'AGI-T™', href: '/inspection/agi-t' },
        ],
      },
    ],
  },
  {
    label: 'Inspection',
    href: '/inspection',
    children: [
      { label: 'AGI-G/R™', href: '/inspection/agi-g-r' },
      { label: 'AGI-T™', href: '/inspection/agi-t' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Corporate Overview', href: '/about/corporate-overview' },
      { label: 'Investor Relations', href: '/about/investor-relations' },
      { label: 'Markets Served', href: '/about/markets-served' },
      { label: 'Quality', href: '/about/quality' },
      { label: 'Job Opportunities', href: '/about/job-opportunities' },
    ],
  },
  {
    label: 'Support',
    href: '/support',
    children: [
      { label: 'Service Bulletins', href: '/support/service-bulletins' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export const footerNav: NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'About Us', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Support', href: '/support' },
  { label: 'News & Events', href: '/news-events' },
  { label: 'Contact Us', href: '/contact' },
];

export const markets = [
  {
    title: 'Solar',
    href: '/products/solar',
    description:
      'Glasstech provides precisely bent or curved glass equipment solutions for concentration solar power (CSP) and concentration photovoltaic (CPV) markets, as well as equipment solutions for fabrication of extremely flat glass for the photovoltaic (PV) market.',
  },
  {
    title: 'Automotive',
    href: '/products/automotive',
    description:
      'Glasstech automotive systems are the products of inventive minds, creative thinking and innovative problem solving. Time and production have proven, beyond a doubt, that our equipment is the most rugged, dependable and versatile.',
  },
  {
    title: 'Architectural',
    href: '/products/architectural',
    description:
      'Glasstech architectural systems are renowned for producing everything from high performance coated glass to large gracefully bent lites to small radius tempered panels for creative interior designs – technology to keep you on the cutting edge.',
  },
  {
    title: 'Aftermarket',
    href: '/products/aftermarket',
    description:
      "Aftermarket services provide our customers with continued support throughout the life cycle of our products. As evidence of the value this service provides our customers, the aftermarket has become one of the fastest growing segments of Glasstech's business.",
  },
];

export const offices = [
  {
    name: 'Headquarters',
    city: 'Perrysburg, Ohio, USA',
    address: '2744 Crossroads Parkway, Perrysburg, OH 43551',
    phone: '+1-419-661-9500',
    fax: '+1-419-661-9616',
  },
  {
    name: 'Shanghai Office',
    city: 'Shanghai, China',
    address: 'Room 1801, No. 88 Century Avenue, Pudong New Area, Shanghai',
    phone: '+86-21-5836-7560',
    fax: '+86-21-5836-8968',
  },
  {
    name: 'Mumbai Office',
    city: 'Mumbai, India',
    address: 'Glasstech India Pvt. Ltd., Mumbai, Maharashtra',
    phone: '+91-98339-22876',
    fax: '+91-98339-22876',
  },
  {
    name: 'New York Office',
    city: 'New York, USA',
    address: 'New York, NY',
    phone: '+1-212-489-8040',
    fax: '+1-212-307-5781',
  },
];
