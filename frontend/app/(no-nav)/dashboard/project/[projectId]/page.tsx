import Link from "next/link";
import ProjectDetail from "@/components/ProjectDetail";
import LocalTime from "@/components/LocalTime";
import { getJwtWithDevFallback } from "@/lib/dev-auth";
import { listDirectoriesForUser } from "@/app/(no-nav)/dashboard/_actions/directories";
import { type DirectoryDTO } from "@/lib/schema/directory";
import { getLocale, getTranslations } from "next-intl/server";

const API = process.env.BACKEND_API_URL!;
if (!API) throw new Error("BACKEND_API_URL non configurato");

export type ProjectDTO = {
  id: string;
  title: string;
  text: string;
  directoryId: string;
  createdAt: string;
  avatar: string;
  avatarImage: string;
  bucketId: string;
  downloadUrl: string;
};

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

  let token: string;
  try {
    token = await getJwtWithDevFallback();
  } catch {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <p className="text-muted-foreground">{tProject("notFound")}</p>
      </div>
    );
  }
  const [project, directories] = await Promise.all([
    fetchProject(projectId, token),
    listDirectoriesForUser(),
  ]);

  const dir: DirectoryDTO | undefined = project
    ? directories.find((d) => d.id === project.directoryId)
    : undefined;

  return (
    <div className="space-y-3 overflow-hidden">
      <nav className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline cursor-pointer">
          {tCommon("home")}
        </Link>
        {dir && (
          <>
            {" / "}
            <Link
              href={`/dashboard/folder/${dir.id}`}
              className="hover:underline cursor-pointer"
              title={dir.name}
            >
              {dir.name}
            </Link>
          </>
        )}
        {project && (
          <>
            {" / "}
            <span title={project.title}>{project.title}</span>
          </>
        )}
      </nav>

      <div className="flex items-center justify-between gap-3">
        <div />
        {project && (
          <span className="text-xs text-muted-foreground shrink-0">
            {tProject("createdOn")}{" "}
            <LocalTime
              iso={project.createdAt}
              locale={locale}
              showSeconds={false}
            />
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
