import { useMount } from 'ahooks';
import { editor } from 'monaco-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { prettierText } from '../../utils';

interface IEditor {
  value: string;
}

export const Editor = (props: IEditor) => {
  const { value } = props;

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
      width={400}
      height="calc(70vh - 56px)"
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
