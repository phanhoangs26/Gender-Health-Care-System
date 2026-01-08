import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useEffect } from 'react';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import {FontSize, TextStyle} from '@tiptap/extension-text-style';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Italic"
      >
        <em>Italic</em>
      </button>
      <select
        value={editor.getAttributes('textStyle')?.fontSize || '16px'}
        onChange={(e) => {
          const size = e.target.value;
          if (size === '16px') {
            // Remove the style if default size is selected
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize(size).run();
          }
        }}
        className="p-1 rounded border border-gray-300 bg-white text-sm"
        title="Text Size"
      >
        <option value="14px">Small</option>
        <option value="16px">Normal</option>
        <option value="18px">Large</option>
        <option value="20px">Larger</option>
      </select>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bullet List"
      >
        • List
      </button>
    </div>
  );
};

const RichTextEditor = ({ value = '', onChange }) => {
  const [mounted, setMounted] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        heading: false,
        textStyle: false,
        listItem: false // Disable listItem from StarterKit
      }),
      TextStyle,
      FontSize,
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6'
        },
        itemTypeName: 'listItem'
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6'
        },
        itemTypeName: 'listItem'
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item'
        }
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Use setTimeout to prevent validation from being called twice
      setTimeout(() => {
        const html = editor.getHTML();
        if (html !== value) {
          onChange(html);
        }
      }, 0);
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  // This effect ensures the editor is properly hydrated on the client side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (mounted && editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor, mounted]);

  if (!mounted) {
    return <div className="min-h-[200px] border rounded-lg p-4">Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg">
      <MenuBar editor={editor} />
      <div className="p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;