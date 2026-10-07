"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Globe2, LayoutGrid, ListOrdered, LockKeyhole, X } from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { FormDisplayMode, FormSettingsInput, FormType } from "@/router/orgs/forms";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/modules/shared/components/ui/sheet";
import { Switch } from "@/modules/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";
import { FormStatusesTab } from "./form-statuses-tab";
import { FormBuilderEditor } from "@/modules/forms/patterns/form-builder";
import { useOrganizationPermissions } from "@/modules/organizations";

export function FormSettingsDrawer({
  open,
  onOpenChange,
  organizationSlug,
  formId,
  initialTab = "general",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  formId: string;
  initialTab?: "general" | "statuses" | "builder";
}) {
  const { canManageForms } = useOrganizationPermissions();
  const { form, error, isLoading } = API.orgs.forms.useFindById({ organizationSlug, formId });
  const update = API.orgs.forms.settings.useUpdateById({ organizationSlug, formId });
  const [tab, setTab] = useState<string>(initialTab);
  const [builderVisited, setBuilderVisited] = useState(initialTab === "builder");
  const [name, setName] = useState("");
  const [type, setType] = useState<FormType>("AUTHENTICATED");
  const [displayMode, setDisplayMode] = useState<FormDisplayMode>("SINGLE_PAGE");
  const [isClosed, setIsClosed] = useState(false);
  const [savedGeneral, setSavedGeneral] = useState<FormSettingsInput | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [builderResetKey, setBuilderResetKey] = useState(0);
  const [builderState, setBuilderState] = useState({ isDirty: false, isSaving: false });

  useEffect(() => {
    if (!open || !form) return;
    setName(form.name);
    setType(form.type);
    setDisplayMode(form.displayMode);
    setIsClosed(form.isClosed);
    setSavedGeneral({
      name: form.name,
      type: form.type,
      displayMode: form.displayMode,
      isClosed: form.isClosed,
    });
  }, [open, form?.id]);

  const hasUnsavedGeneral = savedGeneral
    ? name.trim() !== savedGeneral.name ||
      type !== savedGeneral.type ||
      displayMode !== savedGeneral.displayMode ||
      isClosed !== savedGeneral.isClosed
    : false;

  function requestClose() {
    if (update.isMutating || builderState.isSaving) return;
    if (hasUnsavedGeneral || builderState.isDirty) {
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
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) requestClose();
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-dvh max-h-dvh gap-0 border-0 p-0"
        >
          <SheetTitle className="sr-only">Form settings</SheetTitle>
          <SheetDescription className="sr-only">
            Edit general settings, submission statuses, and form questions.
          </SheetDescription>
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
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value);
                if (value === "builder") setBuilderVisited(true);
              }}
              className="min-h-0 flex-1 gap-0"
            >
              <div className="shrink-0 border-b bg-muted px-4 py-3 sm:px-8">
                <TabsList className="mx-auto flex h-9 w-fit gap-1 rounded-lg bg-transparent p-0">
                  <TabsTrigger
                    value="general"
                    className="rounded-md px-5 text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-background"
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="statuses"
                    className="rounded-md px-5 text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-background"
                  >
                    Statuses
                  </TabsTrigger>
                  <TabsTrigger
                    value="builder"
                    className="rounded-md px-5 text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-background"
                  >
                    Form Builder
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general" className="min-h-0 overflow-y-auto p-4 sm:p-8">
                <form
                  onSubmit={saveGeneral}
                  className="mx-auto w-full min-w-0 max-w-7xl space-y-6 pb-8"
                >
                  <div>
                    <h2 className="text-xl font-semibold">General</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Name, access, and presentation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-form-name">Form name</Label>
                    <Input
                      id="settings-form-name"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Who can respond</p>
                    <RadioGroup
                      aria-label="Who can respond"
                      className="grid gap-3 sm:grid-cols-2"
                      value={type}
                      onValueChange={(value) => setType(value as FormType)}
                    >
                      <Label
                        htmlFor="settings-type-authenticated"
                        className={cn(
                          "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                          type === "AUTHENTICATED" && "border-primary bg-primary/5",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                            type === "AUTHENTICATED" && "bg-primary/10 text-primary",
                          )}
                        >
                          <LockKeyhole className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block text-sm font-semibold">Requires sign-in</span>
                          <span className="block text-xs leading-relaxed text-muted-foreground">
                            Users sign in before submitting.
                          </span>
                        </span>
                        <RadioGroupItem
                          id="settings-type-authenticated"
                          value="AUTHENTICATED"
                          className="shrink-0"
                        />
                      </Label>
                      <Label
                        htmlFor="settings-type-public"
                        className={cn(
                          "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                          type === "PUBLIC" && "border-primary bg-primary/5",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                            type === "PUBLIC" && "bg-primary/10 text-primary",
                          )}
                        >
                          <Globe2 className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block text-sm font-semibold">Public</span>
                          <span className="block text-xs leading-relaxed text-muted-foreground">
                            Anyone with the link can respond.
                          </span>
                        </span>
                        <RadioGroupItem
                          id="settings-type-public"
                          value="PUBLIC"
                          className="shrink-0"
                        />
                      </Label>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Display mode</p>
                    <RadioGroup
                      aria-label="Display mode"
                      className="grid gap-3 sm:grid-cols-2"
                      value={displayMode}
                      onValueChange={(value) => setDisplayMode(value as FormDisplayMode)}
                    >
                      <Label
                        htmlFor="settings-display-single"
                        className={cn(
                          "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                          displayMode === "SINGLE_PAGE" && "border-primary bg-primary/5",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                            displayMode === "SINGLE_PAGE" && "bg-primary/10 text-primary",
                          )}
                        >
                          <LayoutGrid className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block text-sm font-semibold">Single page</span>
                          <span className="block text-xs leading-relaxed text-muted-foreground">
                            Show all sections together.
                          </span>
                        </span>
                        <RadioGroupItem
                          id="settings-display-single"
                          value="SINGLE_PAGE"
                          className="shrink-0"
                        />
                      </Label>
                      <Label
                        htmlFor="settings-display-wizard"
                        className={cn(
                          "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                          displayMode === "WIZARD" && "border-primary bg-primary/5",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                            displayMode === "WIZARD" && "bg-primary/10 text-primary",
                          )}
                        >
                          <ListOrdered className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block text-sm font-semibold">Step by step</span>
                          <span className="block text-xs leading-relaxed text-muted-foreground">
                            Show one section at a time.
                          </span>
                        </span>
                        <RadioGroupItem
                          id="settings-display-wizard"
                          value="WIZARD"
                          className="shrink-0"
                        />
                      </Label>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div>
                      <Label htmlFor="settings-form-closed">Close form</Label>
                      <p className="text-xs text-muted-foreground">
                        Closed forms stop accepting submissions.
                      </p>
                    </div>
                    <Switch
                      id="settings-form-closed"
                      checked={isClosed}
                      onCheckedChange={setIsClosed}
                    />
                  </div>
                  <div className="flex justify-end border-t pt-5">
                    <Button
                      type="submit"
                      disabled={!name.trim() || !hasUnsavedGeneral || update.isMutating}
                    >
                      {update.isMutating ? "Saving…" : "Save general settings"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="statuses" className="min-h-0 overflow-y-auto p-4 sm:p-8">
                <FormStatusesTab organizationSlug={organizationSlug} formId={formId} />
              </TabsContent>

              <TabsContent
                value="builder"
                forceMount
                className="min-h-0 overflow-y-auto p-4 pb-2 data-[state=inactive]:hidden sm:p-8 sm:pb-2"
              >
                {builderVisited && (
                  <FormBuilderEditor
                    key={`${form.id}-${builderResetKey}`}
                    form={form}
                    organizationSlug={organizationSlug}
                    canEdit={canManageForms}
                    hasUnsavedGeneral={hasUnsavedGeneral}
                    onEditorStateChange={setBuilderState}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes in General or Form Builder have not been saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (form) {
                  setName(form.name);
                  setType(form.type);
                  setDisplayMode(form.displayMode);
                  setIsClosed(form.isClosed);
                  setSavedGeneral({
                    name: form.name,
                    type: form.type,
                    displayMode: form.displayMode,
                    isClosed: form.isClosed,
                  });
                }
                setBuilderResetKey((key) => key + 1);
                setBuilderState({ isDirty: false, isSaving: false });
                setConfirmClose(false);
                onOpenChange(false);
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
