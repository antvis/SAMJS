import { defineConfig } from 'dumi';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
// const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
export default defineConfig({
  outputPath: 'docs-dist',
  // locales: [
  //   { id: 'en-us', name: 'English' },
  //   { id: 'zh-cn', name: '中文' },
  // ],

  chainWebpack(memo: any) {
    // 设置 alias

    // 添加额外插件
    memo
      .plugin('monaco-editor')
      .use(MonacoWebpackPlugin, [{ languages: ['json', 'javascript'] }])
      .end()
      .plugin('CopyPlugin')
      .use(CopyPlugin, [
        {
          patterns: [
            {
              from: 'node_modules/onnxruntime-web/dist/*.wasm',
              to: '[name][ext]',
            },
            {
              from: 'docs/assets',
              to: 'assets',
            },
          ],
        },
      ])
      .end();
  },
  mfsu: false,
  theme: {
    '@c-primary': '#0F54FF',
    '@s-content-width': '100%',
  },
  favicons: [
    'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*O5X-S6e--NEAAAAAAAAAAAAADmJ7AQ/original',
  ],
  themeConfig: {
    name: 'SAM.JS',
    logo: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*O5X-S6e--NEAAAAAAAAAAAAADmJ7AQ/original',
    nav: [
      { title: 'DEMO', link: '/demos' },
      { title: 'API', link: '/api' },
    ],
    socialLinks: {
      github: 'https://github.com/lzxue/SAM.JS',
    },
  },
});
