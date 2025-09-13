import { getTranslations } from "next-intl/server";
import ProjectHomeCard from "@/components/ProjectHomeCard";
import ProjectsToolbar from "@/components/ProjectsToolbar";
import Pagination from "@/components/Pagination";
import { listDirectoriesForUser } from "./_actions/directories";
import { type DirectoryDTO } from "@/lib/schema/directory";
import {
  listAllProjectsAction,
  type ProjectListItem,
} from "./_actions/projects";

type SearchParams = {
  page?: string | string[];
  sort?: "createdAt" | "title" | string | string[];
  order?: "asc" | "desc" | string | string[];
  q?: string | string[];
};

function asQ(raw?: string | string[]): string {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s ? String(s) : "";
}

function toIntOr(def: number, raw?: string | string[]) {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(s ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function asSort(raw?: string | string[]): "createdAt" | "title" {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s === "title" || s === "createdAt" ? s : "createdAt";
}

function asOrder(raw?: string | string[]): "asc" | "desc" {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s === "asc" || s === "desc" ? s : "desc";
}

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("Common");

  const sp = await searchParams;
  const page = Math.max(1, toIntOr(1, sp.page));
  const sort = asSort(sp.sort);
  const order = asOrder(sp.order);
  const q = asQ(sp.q);

  // 10 card = 2 righe da 5 -> niente scroll verticale
  const limit = 10;

  const [directories, data] = await Promise.all([
    listDirectoriesForUser() as Promise<DirectoryDTO[]>,
    listAllProjectsAction(page, limit, sort, order, q),
  ]);

  const items: ProjectListItem[] = data.items ?? [];
  const total = data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header fisso */}
      <div className="space-y-2 flex-shrink-0">
        <nav className="text-sm text-muted-foreground">{t("home")}</nav>
        <ProjectsToolbar
          basePath="/dashboard"
          currentSort={sort}
          currentOrder={order}
          isInFolder={false}
        />
      </div>

      {/* Contenuto principale */}
      <div className="flex-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">{t("noProjectsInFolder")}</p>
          </div>
        ) : (
          <ul className="grid gap-1 gap-y-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((p) => (
              <li key={p.id}>
                <ProjectHomeCard
                  item={p}
                  directories={directories}
                  showFolder
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paginazione sempre in basso */}
      <div className="flex justify-center py-4 mt-auto">
        <Pagination
          current={page}
          totalPages={totalPages}
          t={t}
          makeHref={(p) => {
            const qs = new URLSearchParams({ page: String(p), sort, order });
            if (q) qs.set("q", q);
            return `/dashboard?${qs.toString()}`;
          }}
        />
      </div>
    </div>
  );
}
