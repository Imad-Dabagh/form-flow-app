import type { IFormBuilderState } from "@/types/form-builder.types";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockFetchForm(): Promise<IFormBuilderState> {
  await delay(500);
  // In a real app, this would fetch from an API
  const { mockInitialState } = await import("@/data/mock-initial-state");
  return mockInitialState;
}

export async function mockSaveForm(
  state: IFormBuilderState
): Promise<{ success: boolean }> {
  await delay(300);
  // In a real app, this would POST to an API
  console.log("Mock saving form state:", state);
  return { success: true };
}
