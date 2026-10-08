"use client";

import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { FormSubmissionStatus } from "@/router/orgs/forms/submission-statuses";
import { toApiError } from "@/lib/api-error";
import { getOrganizationColorSwatch, ORGANIZATION_PRIMARY_COLORS } from "@/lib/organization";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/modules/shared/components/ui/dialog";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/components/ui/select";
import { Switch } from "@/modules/shared/components/ui/switch";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";

export function FormStatusesTab({ organizationSlug, formId }: {
  organizationSlug: string;
  formId: string;
}) {
  const { statuses, error, isLoading } =
    API.orgs.forms.submissionStatuses.useFindAll({ organizationSlug, formId });
  const { trigger: create } =
    API.orgs.forms.submissionStatuses.useCreateOne({ organizationSlug, formId });
  const { trigger: update } =
    API.orgs.forms.submissionStatuses.useUpdateById({ organizationSlug, formId });
  const { trigger: remove } =
    API.orgs.forms.submissionStatuses.useDeleteById({ organizationSlug, formId });
  const { trigger: reorder } =
    API.orgs.forms.submissionStatuses.useReorder({ organizationSlug, formId });
  const [editing, setEditing] = useState<FormSubmissionStatus | "new" | null>(null);
  const [deleting, setDeleting] = useState<FormSubmissionStatus | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<FormSubmissionStatus["color"]>("blue");
  const [makeDefault, setMakeDefault] = useState(false);
  const [isSubmissionLocked, setIsSubmissionLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function openEditor(status: FormSubmissionStatus | "new") {
    setEditing(status);
    setName(status === "new" ? "" : status.name);
    setDescription(status === "new" ? "" : status.description);
    setColor(status === "new" ? "blue" : status.color);
    setMakeDefault(status === "new" ? false : status.isDefault);
    setIsSubmissionLocked(status === "new" ? false : status.isSubmissionLocked);
  }

  async function saveStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      if (editing === "new") {
        await create({ name: name.trim(), description: description.trim(), color,
          isDefault: makeDefault, isSubmissionLocked });
        toast.success("Status added");
      } else {
        await update({
          submissionStatusId: editing.id,
          input: {
            name: name.trim(), description: description.trim(), color, isSubmissionLocked,
            ...(makeDefault && !editing.isDefault ? { isDefault: true } : {}),
          },
        });
        toast.success("Status updated");
      }
      setEditing(null);
    } catch (saveError) {
      toast.error(toApiError(saveError).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function moveStatus(index: number, direction: -1 | 1) {
    if (isSaving) return;
    const next = statuses.map((status) => status.id);
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setIsSaving(true);
    try {
      await reorder(next);
    } catch (reorderError) {
      toast.error(toApiError(reorderError).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteStatus() {
    if (!deleting || isSaving) return;
    setIsSaving(true);
    try {
      await remove(deleting.id);
      setDeleting(null);
      toast.success("Status deleted");
    } catch (deleteError) {
      toast.error(toApiError(deleteError).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Submission statuses</h2>
          <p className="mt-1 text-sm text-muted-foreground">Organize submissions and choose the starting status for new responses.</p>
        </div>
        <Button type="button" onClick={() => openEditor("new")} disabled={isSaving}>
          <Plus className="size-4" /> Add status
        </Button>
      </div>

      {isLoading && statuses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading statuses…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          {statuses.map((status, index) => (
            <div key={status.id} className="flex flex-wrap items-center gap-3 border-b p-4 last:border-b-0 sm:flex-nowrap">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: getOrganizationColorSwatch(status.color) }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{status.name}</span>
                  {status.isDefault && <Badge variant="secondary"><Star className="size-3" /> Default</Badge>}
                  {status.isSubmissionLocked && <Badge variant="outline">Answers locked</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {status.description || "No description"} · {status.submissionCount} {status.submissionCount === 1 ? "submission" : "submissions"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={`Move ${status.name} up`} disabled={isSaving || index === 0} onClick={() => void moveStatus(index, -1)}><ArrowUp className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={`Move ${status.name} down`} disabled={isSaving || index === statuses.length - 1} onClick={() => void moveStatus(index, 1)}><ArrowDown className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={`Edit ${status.name}`} disabled={isSaving} onClick={() => openEditor(status)}><Pencil className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="size-9 text-destructive hover:text-destructive" aria-label={`Delete ${status.name}`} title={status.isDefault ? "Choose another default first" : status.submissionCount > 0 ? "This status is in use" : undefined} disabled={isSaving || status.isDefault || status.submissionCount > 0} onClick={() => setDeleting(status)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(nextOpen) => { if (!nextOpen && !isSaving) setEditing(null); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add status" : "Edit status"}</DialogTitle>
            <DialogDescription>Choose the name, color, and behavior for this status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveStatus} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="status-name">Name</Label><Input id="status-name" autoFocus required maxLength={50} value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="status-description">Description</Label><Textarea id="status-description" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="status-color">Color</Label>
              <Select value={color} onValueChange={(value) => setColor(value as FormSubmissionStatus["color"])}>
                <SelectTrigger id="status-color" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{ORGANIZATION_PRIMARY_COLORS.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ backgroundColor: getOrganizationColorSwatch(option) }} />{option[0].toUpperCase() + option.slice(1)}</span>
                  </SelectItem>
                ))}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div><Label htmlFor="status-default">Default status</Label><p className="text-xs text-muted-foreground">New submissions start here.</p></div>
              <Switch id="status-default" checked={makeDefault} disabled={editing !== "new" && editing?.isDefault} onCheckedChange={setMakeDefault} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div><Label htmlFor="status-locked">Lock submission answers</Label><p className="text-xs text-muted-foreground">Use when answer editing is available.</p></div>
              <Switch id="status-locked" checked={isSubmissionLocked} onCheckedChange={setIsSubmissionLocked} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={isSaving || !name.trim()}>{isSaving ? "Saving…" : editing === "new" ? "Add status" : "Save status"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(nextOpen) => { if (!nextOpen && !isSaving) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This status will be removed from the form. You cannot undo this action.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isSaving} className="bg-destructive text-white hover:bg-destructive/90" onClick={(event) => { event.preventDefault(); void deleteStatus(); }}>Delete status</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
