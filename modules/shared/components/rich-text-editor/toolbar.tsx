"use client";

import { useState, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/components/ui/popover";
import type { RichTextEditorPreset } from "./index";

export function EditorToolbar({
  editor,
  preset,
}: {
  editor: Editor;
  preset: RichTextEditorPreset;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      blockquote: editor.isActive("blockquote"),
      codeBlock: editor.isActive("codeBlock"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  function saveLink() {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      return;
    }
    setLinkOpen(false);
  }

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-1.5"
    >
      {preset === "full" && (
        <>
          <ToolbarButton
            label="Heading 2"
            active={state.heading2}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={state.heading3}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 />
          </ToolbarButton>
          <ToolbarDivider />
        </>
      )}
      <ToolbarButton
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      {preset === "full" && (
        <ToolbarButton
          label="Strikethrough"
          active={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolbarButton>
      )}
      <ToolbarDivider />
      <ToolbarButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      {preset === "full" && (
        <>
          <ToolbarButton
            label="Quote"
            active={state.blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={state.codeBlock}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 />
          </ToolbarButton>
        </>
      )}
      <ToolbarDivider />
      <Popover
        open={linkOpen}
        onOpenChange={(open) => {
          if (open) setLinkUrl(editor.getAttributes("link").href ?? "");
          setLinkOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant={state.link ? "secondary" : "ghost"}
            aria-label="Edit link"
            aria-pressed={state.link}
            title="Edit link"
          >
            <Link2 />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveLink();
            }}
            className="flex gap-2"
          >
            <Input
              type="url"
              aria-label="Link URL"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <Button type="submit" size="sm">
              Apply
            </Button>
          </form>
          {state.link && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mt-2 px-0"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setLinkOpen(false);
              }}
            >
              Remove link
            </Button>
          )}
        </PopoverContent>
      </Popover>
      {preset === "full" && (
        <ToolbarButton
          label="Clear formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <RemoveFormatting />
        </ToolbarButton>
      )}
      <span className="flex-1" />
      <ToolbarButton
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />;
}
