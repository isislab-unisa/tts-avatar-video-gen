export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="bg-muted/50 rounded-xl p-4">
      Project: {params.projectId}
    </div>
  );
}
