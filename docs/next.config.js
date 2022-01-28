const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
let config = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
})

config = {
  reactStrictMode: true,
  ...config
}

module.exports = config;
