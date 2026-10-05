"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { FormDisplayMode, FormSettingsInput, FormType } from "@/router/orgs/forms";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/modules/shared/components/ui/sheet";
import { Switch } from "@/modules/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";
import { FormStatusesTab } from "./form-statuses-tab";

export function FormSettingsDrawer({
  open,
  onOpenChange,
  organizationSlug,
  formId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  formId: string;
}) {
  const { form, error, isLoading } = API.orgs.forms.useFindById({ organizationSlug, formId });
  const update = API.orgs.forms.settings.useUpdateById({ organizationSlug, formId });
  const [tab, setTab] = useState("general");
  const [name, setName] = useState("");
  const [type, setType] = useState<FormType>("AUTHENTICATED");
  const [displayMode, setDisplayMode] = useState<FormDisplayMode>("SINGLE_PAGE");
  const [isClosed, setIsClosed] = useState(false);
  const [savedGeneral, setSavedGeneral] = useState<FormSettingsInput | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (!open || !form) return;
    setName(form.name);
    setType(form.type);
    setDisplayMode(form.displayMode);
    setIsClosed(form.isClosed);
    setSavedGeneral({ name: form.name, type: form.type, displayMode: form.displayMode, isClosed: form.isClosed });
  }, [open, form?.id]);

  const hasUnsavedGeneral = savedGeneral ? (
    name.trim() !== savedGeneral.name || type !== savedGeneral.type
    || displayMode !== savedGeneral.displayMode || isClosed !== savedGeneral.isClosed
  ) : false;

  function requestClose() {
    if (update.isMutating) return;
    if (hasUnsavedGeneral) {
      setConfirmClose(true);
      return;
    }
    onOpenChange(false);
  }

  async function saveGeneral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || update.isMutating) return;
    try {
      const input = { name: name.trim(), type, displayMode, isClosed };
      await update.trigger(input);
      setSavedGeneral(input);
      toast.success("Form settings saved");
    } catch (saveError) {
      toast.error(toApiError(saveError).message);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) requestClose(); }}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-dvh max-h-dvh gap-0 border-0 p-0"
        >
          <SheetTitle className="sr-only">Form settings</SheetTitle>
          <SheetDescription className="sr-only">Edit general settings and submission statuses.</SheetDescription>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Close form settings"
            onClick={requestClose}
            className="absolute right-4 top-3 z-10 sm:right-8"
          >
            <X className="size-4" />
          </Button>

          {isLoading && !form ? (
            <p className="p-8 text-sm text-muted-foreground">Loading form settings…</p>
          ) : error || !form ? (
            <p className="p-8 text-sm text-destructive">{error?.message ?? "Form unavailable."}</p>
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
              <div className="shrink-0 border-b bg-muted px-4 py-3 sm:px-8">
                <TabsList className="mx-auto flex h-9 w-fit gap-1 rounded-lg bg-transparent p-0">
                  <TabsTrigger value="general" className="rounded-md px-5 text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-background">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="statuses" className="rounded-md px-5 text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-background">
                    Statuses
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general" className="min-h-0 overflow-y-auto p-4 sm:p-8">
                <form onSubmit={saveGeneral} className="mx-auto max-w-2xl space-y-6 pb-8">
                  <div>
                    <h2 className="text-xl font-semibold">General</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Name, access, and presentation.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-form-name">Form name</Label>
                    <Input id="settings-form-name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Who can respond</p>
                    <RadioGroup aria-label="Who can respond" className="grid gap-3 sm:grid-cols-2" value={type} onValueChange={(value) => setType(value as FormType)}>
                      <Label htmlFor="settings-type-authenticated" className={cn("flex min-h-24 cursor-pointer items-start gap-2 rounded-lg border p-3 font-normal hover:bg-muted/50", type === "AUTHENTICATED" && "border-primary bg-primary/5")}>
                        <RadioGroupItem id="settings-type-authenticated" value="AUTHENTICATED" className="mt-0.5" />
                        <span><span className="block text-sm font-medium">Requires sign-in</span><span className="block text-xs text-muted-foreground">Users sign in before submitting.</span></span>
                      </Label>
                      <Label htmlFor="settings-type-public" className={cn("flex min-h-24 cursor-pointer items-start gap-2 rounded-lg border p-3 font-normal hover:bg-muted/50", type === "PUBLIC" && "border-primary bg-primary/5")}>
                        <RadioGroupItem id="settings-type-public" value="PUBLIC" className="mt-0.5" />
                        <span><span className="block text-sm font-medium">Public</span><span className="block text-xs text-muted-foreground">Anyone with the link can respond.</span></span>
                      </Label>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-display-mode">Display mode</Label>
                    <Select value={displayMode} onValueChange={(value) => setDisplayMode(value as FormDisplayMode)}>
                      <SelectTrigger id="settings-display-mode" className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="SINGLE_PAGE">Single page</SelectItem><SelectItem value="WIZARD">Step by step</SelectItem></SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Show every section together or one section at a time.</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div><Label htmlFor="settings-form-closed">Close form</Label><p className="text-xs text-muted-foreground">Closed forms stop accepting submissions.</p></div>
                    <Switch id="settings-form-closed" checked={isClosed} onCheckedChange={setIsClosed} />
                  </div>
                  <div className="flex justify-end border-t pt-5">
                    <Button type="submit" disabled={!name.trim() || !hasUnsavedGeneral || update.isMutating}>
                      {update.isMutating ? "Saving…" : "Save general settings"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="statuses" className="min-h-0 overflow-y-auto p-4 sm:p-8">
                <FormStatusesTab organizationSlug={organizationSlug} formId={formId} />
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved settings?</AlertDialogTitle>
            <AlertDialogDescription>Your changes in General have not been saved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (form) {
                setName(form.name);
                setType(form.type);
                setDisplayMode(form.displayMode);
                setIsClosed(form.isClosed);
                setSavedGeneral({ name: form.name, type: form.type, displayMode: form.displayMode, isClosed: form.isClosed });
              }
              setConfirmClose(false);
              onOpenChange(false);
            }}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
