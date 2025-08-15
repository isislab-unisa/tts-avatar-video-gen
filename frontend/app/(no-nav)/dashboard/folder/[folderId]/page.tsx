export default function FolderPage({
  params,
}: {
  params: { folderId: string };
}) {
  return (
    <div className="bg-muted/50 rounded-xl p-4">Folder: {params.folderId}</div>
  );
}
