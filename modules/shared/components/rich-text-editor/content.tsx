"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: true,
      HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
    },
  }),
];

export function RichTextContent({ html, className }: { html: string; className?: string }) {
  const editor = useEditor({
    extensions,
    content: html,
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rich-text-editor-content rich-text-viewer-content" } },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== html) {
      editor.commands.setContent(html, { emitUpdate: false });
    }
  }, [editor, html]);

  return <EditorContent editor={editor} className={cn("text-sm leading-relaxed", className)} />;
}
