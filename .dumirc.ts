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
              from: 'docs/model',
              to: 'model',
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
  themeConfig: {
    name: 'SAM.JS',
    nav: [
      { title: 'DEMO', link: '/demos' },
      { title: 'API', link: '/api' },
    ],
  },
});
