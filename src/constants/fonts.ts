import localFont from 'next/font/local';

export const manrope = localFont({
  src: [
    {
      path: '../../public/fonts/manrope-v20-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/manrope-v20-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/manrope-v20-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/manrope-v20-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-main', // optional, if you want to use CSS var
});
