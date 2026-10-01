export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_SUBMISSION_FILES = 10;

export const uploadExtensions: Record<"all" | "documents" | "images", string[]> = {
  all: ["pdf", "docx", "xlsx", "pptx", "jpg", "png", "webp", "gif"],
  documents: ["pdf", "docx", "xlsx", "pptx"],
  images: ["jpg", "png", "webp", "gif"],
};
