"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormsStore } from "@/modules/forms/lib/forms-store";
import { Button } from "@/modules/shared/components/ui/button";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/components/ui/dialog";
import type { Submission } from "@/modules/forms/types";

export function FormResponses() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getFormById, getSubmissionsByFormId } = useFormsStore();

  const form = getFormById(id);
  const submissions = getSubmissionsByFormId(id);

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Form not found
          </h2>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const allFields = form.content.flatMap((section) => section.fields);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    return answer;
  };

  const handleExportCSV = () => {
    const headers = [
      "Submission ID",
      "Submitted At",
      ...allFields.map((f) => f.title),
    ];
    const rows = submissions.map((sub) => [
      sub.id,
      sub.submittedAt,
      ...allFields.map((field) => formatAnswer(sub.answers[field.id] || "")),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, "_")}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFieldTitle = (fieldId: string) => {
    const field = allFields.find((f) => f.id === fieldId);
    return field?.title || fieldId;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {form.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {submissions.length}{" "}
                  {submissions.length === 1 ? "response" : "responses"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/builder/${id}`)}
              >
                Edit Form
              </Button>
              {submissions.length > 0 && (
                <Button onClick={handleExportCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {submissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No responses yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Responses will appear here once people submit your form
            </p>
            <Button onClick={() => router.push(`/form/${id}`)}>
              View Form
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Submitted</TableHead>
                    {allFields.slice(0, 4).map((field) => (
                      <TableHead key={field.id}>{field.title}</TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(submission.submittedAt)}
                      </TableCell>
                      {allFields.slice(0, 4).map((field) => (
                        <TableCell key={field.id}>
                          <div className="max-w-xs truncate">
                            {formatAnswer(submission.answers[field.id] || "-")}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(submission);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && formatDate(selectedSubmission.submittedAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {form.content.map((section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <div className="text-sm font-medium text-foreground">
                          {field.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatAnswer(
                            selectedSubmission.answers[field.id] ||
                              "No answer provided"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Submission ID: {selectedSubmission.id}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
