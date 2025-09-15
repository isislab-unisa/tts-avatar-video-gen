export function getErrorMessage(key: string): string {
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
