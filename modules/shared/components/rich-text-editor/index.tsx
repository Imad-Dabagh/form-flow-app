"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./toolbar";

export type RichTextEditorPreset = "compact" | "full";

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  preset?: RichTextEditorPreset;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  minHeight?: number;
};

export function RichTextEditor({
  value,
  onChange,
  preset = "compact",
  placeholder = "Write something…",
  disabled = false,
  id,
  ariaLabel = "Rich text editor",
  className,
  minHeight = preset === "compact" ? 96 : 240,
}: RichTextEditorProps) {
  const isFull = preset === "full";
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: isFull ? { levels: [2, 3] } : false,
        blockquote: isFull ? {} : false,
        codeBlock: isFull ? {} : false,
        code: isFull ? {} : false,
        horizontalRule: false,
        strike: isFull ? {} : false,
        link: {
          openOnClick: false,
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    [isFull, placeholder],
  );
  const editor = useEditor(
    {
      extensions,
      content: value,
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          "aria-label": ariaLabel,
          class: "rich-text-editor-content",
          ...(id ? { id } : {}),
        },
      },
      onUpdate: ({ editor }) => {
        const nextValue = editor.isEmpty ? "" : editor.getHTML();
        if (nextValue !== valueRef.current) onChangeRef.current(nextValue);
      },
    },
    [extensions, ariaLabel, id],
  );

  useEffect(() => {
    if (editor && editor.getHTML() !== value && !(editor.isEmpty && value === "")) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor && editor.isEditable !== !disabled) {
      editor.setEditable(!disabled, false);
    }
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rich-text-editor overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled && "opacity-60",
        className,
      )}
      style={{ "--editor-min-height": `${minHeight}px` } as CSSProperties}
    >
      {!disabled && editor && <EditorToolbar editor={editor} preset={preset} />}
      <EditorContent editor={editor} />
    </div>
  );
}
