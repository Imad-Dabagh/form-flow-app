"use client";

import type React from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useFormsStore } from "@/modules/forms/lib/forms-store";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import { Label } from "@/modules/shared/components/ui/label";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { CheckCircle2, Upload, AlertCircle } from "lucide-react";
import type { Field } from "@/modules/forms/types";

export function PublicForm() {
  const params = useParams<{ id: string }>();
  const { id } = params;

  // FIX: Use selector to ensure reactivity
  const form = useFormsStore((state) => state.forms.find((f) => f.id === id));
  const addSubmission = useFormsStore((state) => state.addSubmission);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Form not found
          </h2>
          <p className="text-muted-foreground">
            This form does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  if (form.status === "draft") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md p-6 mx-auto text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Form Not Published
          </h2>
          <p className="text-muted-foreground">
            This form is currently in <strong>Draft</strong> mode. Please
            publish it from the builder settings to make it accessible.
          </p>
        </div>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setAnswers({ ...answers, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" });
    }
  };

  const handleCheckboxChange = (
    fieldId: string,
    option: string,
    checked: boolean
  ) => {
    const currentValues = (answers[fieldId] as string[]) || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v) => v !== option);
    handleFieldChange(fieldId, newValues);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    form.content.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required) {
          const answer = answers[field.id];
          if (
            !answer ||
            (Array.isArray(answer) && answer.length === 0) ||
            answer === ""
          ) {
            newErrors[field.id] = "This field is required";
          }
        }
        // ... (rest of validation logic stays the same)
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addSubmission({
      formId: id,
      answers,
    });

    setSubmitted(true);
  };

  // ... (renderField function stays the same as previous)
  const renderField = (field: Field) => {
    const hasError = !!errors[field.id];

    switch (field.type) {
      case "text":
      case "email":
      case "url":
      case "date":
      case "time":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={(answers[field.id] as string) || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? "border-destructive" : ""}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={(answers[field.id] as string) || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            min={field.min}
            max={field.max}
            className={hasError ? "border-destructive" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={(answers[field.id] as string) || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={5}
            className={`min-h-[150px] resize-y ${
              hasError ? "border-destructive" : ""
            }`}
          />
        );

      case "select":
        return (
          <Select
            value={(answers[field.id] as string) || ""}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger className={hasError ? "border-destructive" : ""}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={(answers[field.id] as string) || ""}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label
                  htmlFor={`${field.id}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={((answers[field.id] as string[]) || []).includes(
                    option
                  )}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(field.id, option, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`${field.id}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "upload":
        return (
          <div className="space-y-2">
            <div
              className={`border rounded-md px-3 py-2 bg-background flex items-center gap-2 ${
                hasError ? "border-destructive" : "border-input"
              }`}
            >
              <Upload className="w-4 h-4 text-muted-foreground" />
              <Input
                type="file"
                className="h-auto p-0 border-0 shadow-none cursor-pointer file:bg-secondary file:text-secondary-foreground file:border-0 file:rounded-md file:mr-4 file:px-2 file:text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFieldChange(field.id, file.name);
                }}
              />
            </div>
            {answers[field.id] && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                File selected:{" "}
                <span className="font-medium text-foreground">
                  {answers[field.id]}
                </span>
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="p-8 border rounded-lg shadow-sm bg-card border-border">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Thank you!
            </h2>
            <p className="mb-6 text-muted-foreground">
              Your response has been submitted successfully.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another Response
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="overflow-hidden border rounded-lg shadow-sm bg-card border-border">
          <div className="p-8 border-b bg-muted/30 border-border">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-lg text-muted-foreground">
                {form.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {form.content.map((section, sectionIndex) => (
                <div key={section.id}>
                  {sectionIndex > 0 && (
                    <div className="mb-8 -mx-8 border-t border-border" />
                  )}
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="mb-6 -mt-4 text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                  <div className="space-y-6">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label
                          htmlFor={field.id}
                          className="text-base font-medium"
                        >
                          {field.title}
                          {field.required && (
                            <span className="ml-1 text-destructive">*</span>
                          )}
                        </Label>
                        {field.description && (
                          <p className="text-sm text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                        {renderField(field)}
                        {errors[field.id] && (
                          <p className="text-sm font-medium text-destructive">
                            {errors[field.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 mt-8 border-t border-border">
              <Button type="submit" size="lg" className="w-full text-base">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
