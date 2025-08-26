// app/(no-nav)/dashboard/project/[projectId]/page.tsx
import Link from "next/link";
import ProjectDetail from "@/components/ProjectDetail";
import { cloneRequestHeaders } from "@/lib/headers";
import { auth } from "@/lib/auth";
import { signApiToken } from "@/lib/jwt";
import { listDirectoriesForUser } from "@/app/(no-nav)/dashboard/_actions/directories";
import type { ProjectDTO } from "./_actions";

const API = process.env.BACKEND_API_URL!;

async function fetchProject(
  id: string,
  token: string
): Promise<ProjectDTO | null> {
  const res = await fetch(`${API}/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as ProjectDTO;
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params; // Next 15: params è una Promise

  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) {
    // niente sessione → mostra “non trovato” coerente
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <p className="text-muted-foreground">Progetto non trovato.</p>
      </div>
    );
  }

  const token = await signApiToken(session.user.id);

  const [project, directories] = await Promise.all([
    fetchProject(projectId, token),
    listDirectoriesForUser(),
  ]);

  const dir = project
    ? directories.find((d) => d.id === project.directoryId)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4">
      {/* Breadcrumb e data in alto a destra */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <nav className="text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">
            Home
          </Link>
          {dir ? (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/dashboard/folder/${dir.id}`}
                className="hover:underline"
              >
                {dir.name}
              </Link>
            </>
          ) : null}
          {project ? (
            <>
              <span className="mx-2">/</span>
              <span className="text-foreground">{project.title}</span>
            </>
          ) : null}
        </nav>

        {project && (
          <span className="text-xs text-muted-foreground">
            {/* solo qui (niente duplicato nel pannello) */}
            Creato il {new Date(project.createdAt).toLocaleString()}
          </span>
        )}
      </div>

      <ProjectDetail
        project={project}
        directories={directories.filter((d) =>
          project ? d.id !== project.directoryId : true
        )}
      />
    </div>
  );
}
