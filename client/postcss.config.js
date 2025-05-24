const tailwindcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano')({
  preset: [
    'default',
    {
      discardComments: {
        removeAll: true,
      },
      normalizeWhitespace: false,
    },
  ],
});

module.exports = (ctx) => {
  // Only enable CSS minification in production
  const plugins = [
    tailwindcss,
    autoprefixer({
      flexbox: 'no-2009',
      grid: 'autoplace',
      overrideBrowserslist: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 11',
      ],
    }),
  ];

  if (ctx.env === 'production') {
    plugins.push(cssnano);
  }

  return { plugins };
};