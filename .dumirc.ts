import { defineConfig } from 'dumi';
// const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
export default defineConfig({
  outputPath: 'docs-dist',
  // locales: [
  //   { id: 'en-us', name: 'English' },
  //   { id: 'zh-cn', name: '中文' },
  // ],

  chainWebpack(memo, { env, webpack }) {
    // 设置 alias

    // 添加额外插件
    memo.plugin('CopyPlugin').use(CopyPlugin, [
      {
        patterns: [
          {
            from: 'node_modules/onnxruntime-web/dist/*.wasm',
            to: '[name][ext]',
          },
          {
            from: 'docs/model',
            to: 'model',
          },
        ],
      },
    ]);
  },
  mfsu: false,
  themeConfig: {
    name: 'SAM.JS',
    nav: [
      { title: 'DEMO', link: '/demos' },
      { title: 'API', link: '/api' },
    ],
  },
});
