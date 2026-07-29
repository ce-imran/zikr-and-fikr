import React, { useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Font = Quill.import('formats/font');
Font.whitelist = ['inter', 'jameel-noori-regular', 'jameel-noori-kasheeda'];
Quill.register(Font, true);

export default function RichTextEditor({ value, onChange, placeholder = 'Write your daily reflection manually...' }) {
  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ font: ['inter', 'jameel-noori-regular', 'jameel-noori-kasheeda'] }],
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'font',
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor-container bg-white dark:bg-emerald-950/60 rounded-xl overflow-hidden border border-gray-300 dark:border-emerald-800/60">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-gray-900 dark:text-gray-100 min-h-[300px]"
      />
    </div>
  );
}
