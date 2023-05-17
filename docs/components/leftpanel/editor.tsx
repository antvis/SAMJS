import { useMount } from 'ahooks';
import { editor } from 'monaco-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface IEditor {
  value: string;
}

export const Editor = (props: IEditor) => {
  const { value } = props;

  function prettierText(options: { content: string }) {
    const { content } = options;
    let newContent = content;
    if (typeof content !== 'string') {
      newContent = JSON.stringify(content, null, 2);
    }

    const newText = prettier.format(newContent, {
      parser: 'json',
      plugins: [parserBabel],
    });
    return newText;
  }

  monacoEditor.languages.registerDocumentFormattingEditProvider('json', {
    provideDocumentFormattingEdits: (model: editor.ITextModel) => {
      return [
        {
          range: model.getFullModelRange(),
          text: prettierText({ content: model.getValue() }),
        },
      ];
    },
  });

  useMount(() => {
    monacoEditor.editor.defineTheme('custome-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#fafafa',
        'editorLineNumber.foreground': '#222222',
        'editor.lineHighlightBackground': '#f4f4f4',
      },
    });
  });

  return (
    <MonacoEditor
      width={380}
      height="65vh"
      language="json"
      value={prettierText({ content: value })}
      theme="custome-theme"
      options={{
        selectOnLineNumbers: true,
        tabIndex: 2,
        tabSize: 2,
        folding: true,
        fontSize: 13,
        mouseStyle: 'text',
        foldingStrategy: 'indentation',
        scrollBeyondLastLine: false,
        foldingMaximumRegions: Number.MAX_SAFE_INTEGER,
        suggest: {
          showKeywords: true,
        },
      }}
    />
  );
};
