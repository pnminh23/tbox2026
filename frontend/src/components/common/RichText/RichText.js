// components/RichTextEditor.jsx (hoặc tên file RichText.jsx của bạn)
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import React, { useEffect } from "react";
import styles from "./RichText.module.scss";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const menuItems = [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      icon: <Bold size={18} />,
      isActive: editor.isActive("bold"),
      title: "Bold",
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      icon: <Italic size={18} />,
      isActive: editor.isActive("italic"),
      title: "Italic",
    },
    {
      action: () => editor.chain().focus().toggleStrike().run(),
      icon: <Strikethrough size={18} />,
      isActive: editor.isActive("strike"),
      title: "Strikethrough",
    },
    {
      action: () => editor.chain().focus().toggleCode().run(),
      icon: <Code size={18} />,
      isActive: editor.isActive("code"),
      title: "Code",
    },
    {
      type: "divider",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      icon: <Heading1 size={18} />,
      isActive: editor.isActive("heading", { level: 1 }),
      title: "Heading 1",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      icon: <Heading2 size={18} />,
      isActive: editor.isActive("heading", { level: 2 }),
      title: "Heading 2",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      icon: <Heading3 size={18} />,
      isActive: editor.isActive("heading", { level: 3 }),
      title: "Heading 3",
    },
    {
      action: () => editor.chain().focus().toggleBulletList().run(),
      icon: <List size={18} />,
      isActive: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      action: () => editor.chain().focus().toggleOrderedList().run(),
      icon: <ListOrdered size={18} />,
      isActive: editor.isActive("orderedList"),
      title: "Ordered List",
    },
    {
      action: () => editor.chain().focus().toggleBlockquote().run(),
      icon: <Quote size={18} />,
      isActive: editor.isActive("blockquote"),
      title: "Blockquote",
    },
    {
      type: "divider",
    },
    {
      action: () => editor.chain().focus().setHorizontalRule().run(),
      icon: <Minus size={18} />,
      title: "Horizontal Rule",
    },
    {
      type: "divider",
    },
    {
      action: () => editor.chain().focus().undo().run(),
      icon: <Undo size={18} />,
      disabled: !editor.can().chain().focus().undo().run(),
      title: "Undo",
    },
    {
      action: () => editor.chain().focus().redo().run(),
      icon: <Redo size={18} />,
      disabled: !editor.can().chain().focus().redo().run(),
      title: "Redo",
    },
  ];

  return (
    <div className={styles.toolbar}>
      {menuItems.map((item, index) =>
        item.type === "divider" ? (
          <div key={index} className={styles.divider} />
        ) : (
          <button
            key={index}
            onClick={item.action}
            className={`${styles.toolbarButton} ${
              item.isActive ? styles.isActive : ""
            }`}
            disabled={item.disabled}
            title={item.title}
          >
            {item.icon}
          </button>
        )
      )}
    </div>
  );
};

const RichText = ({ initialContent, onChange, contentClass }) => {
  // Bỏ onBlur khỏi props
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Tùy chỉnh các extension của StarterKit nếu cần
        // ví dụ: gapcursor: false,
      }),
    ],
    content: initialContent || "", // (A) Tiptap sẽ sử dụng giá trị này khi khởi tạo
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    // onBlur đã được bỏ
    editorProps: {
      attributes: {
        class: `prose-mirror-content ${styles.editorContent} ${
          contentClass || ""
        }`,
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return; // Nếu editor chưa sẵn sàng, không làm gì cả
    }

    const currentEditorHTML = editor.getHTML();
    const newContent = initialContent || ""; // Đảm bảo newContent là một chuỗi

    // Chỉ cập nhật nếu nội dung từ prop thực sự khác với nội dung hiện tại của editor
    // Điều này tránh việc cập nhật không cần thiết có thể làm mất vị trí con trỏ.
    if (newContent !== currentEditorHTML) {
      // console.log("RichText useEffect: initialContent thay đổi. Đang cập nhật editor.");
      // Tham số `false` ngăn việc phát sự kiện 'update',
      // vì thay đổi này đến từ prop, không phải từ người dùng nhập.
      editor.commands.setContent(newContent, false);
    }
  }, [initialContent, editor]); // Mảng phụ thuộc: Chạy lại effect này nếu initialContent hoặc editor thay đổi

  return (
    <div className={styles.editorContainer}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichText;
