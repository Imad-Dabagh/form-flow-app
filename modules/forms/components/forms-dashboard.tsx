"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useFormsStore } from "@/modules/forms/lib/forms-store"
import { Button } from "@/modules/shared/components/ui/button"
import { Input } from "@/modules/shared/components/ui/input"
import { PlusCircle, Search, FileText, MoreVertical, ExternalLink, Copy, Pencil, Trash2, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/components/ui/dialog"
import { Label } from "@/modules/shared/components/ui/label"
import { Textarea } from "@/modules/shared/components/ui/textarea"
import { Badge } from "@/modules/shared/components/ui/badge"
import {
  organizationWorkspacePath,
  useOrganizationWorkspace,
} from "@/modules/organizations"

export function FormsDashboard() {
  const router = useRouter()
  const organization = useOrganizationWorkspace()
  const { forms: allForms, createForm, deleteForm, duplicateForm, getSubmissionsByFormId } = useFormsStore()
  const forms = allForms.filter((form) => form.organizationId === organization.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [showNewFormDialog, setShowNewFormDialog] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState("")
  const [newFormDescription, setNewFormDescription] = useState("")

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateForm = () => {
    if (!newFormTitle.trim()) {
      toast.error("Error", {
        description: "Please enter a form title",
      })
      return
    }

    const newForm = createForm({
      organizationId: organization.id,
      title: newFormTitle,
      description: newFormDescription,
      status: "draft",
      content: [
        {
          id: "section-1",
          title: "Untitled Section",
          fields: [],
        },
      ],
    })

    setShowNewFormDialog(false)
    setNewFormTitle("")
    setNewFormDescription("")

    toast.success("Form created", {
      description: "Your new form has been created successfully",
    })

    router.push(organizationWorkspacePath(organization.slug, `/forms/${newForm.id}/builder`))
  }

  const handleDuplicateForm = (formId: string) => {
    const duplicated = duplicateForm(formId)
    if (duplicated) {
      toast.success("Form duplicated", {
        description: "A copy of the form has been created",
      })
    }
  }

  const handleDeleteForm = (formId: string) => {
    deleteForm(formId)
    toast.success("Form deleted", {
      description: "The form has been permanently deleted",
    })
  }

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied", {
      description: "Form link has been copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Forms</h1>
              <p className="text-sm text-muted-foreground mt-1">Create and manage your forms</p>
            </div>
            <Button onClick={() => setShowNewFormDialog(true)} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Form
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No forms found" : "No forms yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search query" : "Get started by creating your first form"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowNewFormDialog(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Create Form
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => {
              const submissionCount = getSubmissionsByFormId(form.id).length

              return (
                <div
                  key={form.id}
                  className="group bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate mb-1">{form.title}</h3>
                        {form.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(organizationWorkspacePath(organization.slug, `/forms/${form.id}/builder`))}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/form/${form.id}`)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Form
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(organizationWorkspacePath(organization.slug, `/forms/${form.id}/responses`))}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Responses ({submissionCount})
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(form.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateForm(form.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteForm(form.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant={form.status === "published" ? "default" : "secondary"} className="text-xs">
                        {form.status}
                      </Badge>
                      <span>{formatDate(form.updatedAt)}</span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {submissionCount}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border p-3 bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(organizationWorkspacePath(organization.slug, `/forms/${form.id}/builder`))}
                    >
                      <Pencil className="w-3 h-3 mr-2" />
                      Edit Form
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={showNewFormDialog} onOpenChange={setShowNewFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>Give your form a title and optional description</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                placeholder="e.g., Customer Feedback"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateForm()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this form for?"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFormDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateForm}>Create Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
