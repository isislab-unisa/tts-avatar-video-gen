import Link from "next/link";
import ProjectDetail from "@/components/ProjectDetail";
import { cloneRequestHeaders } from "@/lib/headers";
import { auth } from "@/lib/auth";
import { signApiToken } from "@/lib/jwt";
import {
  listDirectoriesForUser,
  type DirectoryDTO,
} from "@/app/(no-nav)/dashboard/_actions/directories";
import type { ProjectDTO } from "./_actions";
import { getLocale, getTranslations } from "next-intl/server";

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
  const { projectId } = await params;

  const [tProject, tCommon, locale] = await Promise.all([
    getTranslations("Project"),
    getTranslations("Common"),
    getLocale(),
  ]);

  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <p className="text-muted-foreground">{tProject("notFound")}</p>
      </div>
    );
  }

  const token = await signApiToken(session.user.id);
  const [project, directories] = await Promise.all([
    fetchProject(projectId, token),
    listDirectoriesForUser(),
  ]);

  const dir: DirectoryDTO | undefined = project
    ? directories.find((d) => d.id === project.directoryId)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4">
      {/* Breadcrumb + data (no overflow) */}
      <div className="flex items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 overflow-x-hidden text-sm text-muted-foreground"
        >
          <div className="inline-flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hover:underline cursor-pointer shrink-0"
            >
              {tCommon("home")}
            </Link>

            {dir && (
              <>
                <span className="shrink-0">/</span>
                <Link
                  href={`/dashboard/folder/${dir.id}`}
                  className="hover:underline cursor-pointer truncate max-w-[30vw] sm:max-w-[40vw] md:max-w-[20vw] lg:max-w-[24rem]"
                  title={dir.name}
                >
                  {dir.name}
                </Link>
              </>
            )}

            {project && (
              <>
                <span className="shrink-0">/</span>
                <span
                  className="text-foreground truncate max-w-[40vw] sm:max-w-[50vw] md:max-w-[28vw] lg:max-w-[32rem]"
                  title={project.title}
                >
                  {project.title}
                </span>
              </>
            )}
          </div>
        </nav>

        {project && (
          <span className="text-xs text-muted-foreground shrink-0">
            {tProject("createdOn")}{" "}
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "short",
              timeStyle: "medium",
            }).format(new Date(project.createdAt))}
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
