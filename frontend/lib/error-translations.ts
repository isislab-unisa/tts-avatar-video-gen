// Helper function to get error messages from translations
// This replaces the old error-messages.ts file

export function getErrorMessage(key: string): string {
  // Fallback messages in case translations are not available
  const fallbackMessages: Record<string, string> = {
    notAuthenticated: "Not authenticated",
    renameError: "Rename error",
    moveError: "Move error",
    deleteError: "Delete error",
    projectNotFound: "Project not found",
    downloadFailed: "Download failed",
    folderFallback: "Folder",
    duplicateTitle: "A project with this title already exists",
    downloadUrlMissing: "Download URL not available",
    videoUrlMissing: "Video URL not available",
  };

  // For server-side usage, we'll use the fallback messages
  // The actual translations will be handled by next-intl on the client side
  return fallbackMessages[key] || key;
}

// Type for error message keys
export type ErrorMessageKey =
  | "notAuthenticated"
  | "renameError"
  | "moveError"
  | "deleteError"
  | "projectNotFound"
  | "downloadFailed"
  | "folderFallback"
  | "duplicateTitle"
  | "downloadUrlMissing"
  | "videoUrlMissing";
