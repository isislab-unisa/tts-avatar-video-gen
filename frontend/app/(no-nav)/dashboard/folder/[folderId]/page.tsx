import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ProjectHomeCard from "@/components/ProjectHomeCard";
import { SortDropdown } from "@/components/sort-dropdown";
import {
  listDirectoriesForUser,
  type DirectoryDTO,
} from "../../_actions/directories";
import {
  listProjectsByDirAction,
  type ProjectListItem,
} from "../../_actions/projects";

type Params = { folderId: string };
type SearchParams = {
  page?: string;
  sort?: "createdAt" | "title";
  order?: "asc" | "desc";
};

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

export default async function FolderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const t = await getTranslations("Common");

  const sp = searchParams ?? {};
  const page = Math.max(1, toIntOr(1, sp.page));
  const sort = asSort(sp.sort);
  const order = asOrder(sp.order);
  // 10 card = 2 righe da 5 -> niente scroll verticale
  const limit = 10;

  const [directories, data] = await Promise.all([
    listDirectoriesForUser() as Promise<DirectoryDTO[]>,
    listProjectsByDirAction(params.folderId, page, limit, sort, order),
  ]);

  const items: ProjectListItem[] = data.items ?? [];
  const total = data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentDir = directories.find((d) => d.id === params.folderId);

  return (
    // Niente micro–scroll: blocco l'altezza e rendo scrollabile solo il grid se serve
    <div className="space-y-3 overflow-hidden">
      <nav className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="underline hover:no-underline">
          {t("home")}
        </Link>{" "}
        / {currentDir?.name ?? "Cartella"}
      </nav>

      <div className="flex justify-end">
        <SortDropdown
          basePath={`/dashboard/folder/${params.folderId}`}
          currentSort={sort}
          currentOrder={order}
        />
      </div>

      {/* Contenuto + paginazione ancorata in basso */}
      <div className="flex h-[calc(100vh-10rem)] flex-col">
        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="h-full grid place-items-center">
              <p className="text-muted-foreground">{t("noProjectsFound")}</p>
            </div>
          ) : (
            <ul className="h-full overflow-auto pr-1 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((p) => (
                <li key={p.id}>
                  <ProjectHomeCard
                    item={p}
                    directories={directories}
                    showFolder={false}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center pt-1">
          <Pagination
            current={page}
            totalPages={totalPages}
            t={t}
            makeHref={(p) => {
              const qs = new URLSearchParams({ page: String(p), sort, order });
              return `/dashboard/folder/${params.folderId}?${qs.toString()}`;
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Pagination({
  current,
  totalPages,
  t,
  makeHref,
}: {
  current: number;
  totalPages: number;
  t: (key: string) => string;
  makeHref: (p: number) => string;
}) {
  const prevDisabled = current <= 1;
  const nextDisabled = current >= totalPages;
  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={prevDisabled ? "#" : makeHref(current - 1)}
        className={`px-3 py-2 rounded-md border ${
          prevDisabled ? "pointer-events-none opacity-50" : ""
        }`}
        aria-disabled={prevDisabled}
      >
        ←
      </Link>
      <span className="text-sm">
        {t("page")} {current} {t("of")} {totalPages}
      </span>
      <Link
        href={nextDisabled ? "#" : makeHref(current + 1)}
        className={`px-3 py-2 rounded-md border ${
          nextDisabled ? "pointer-events-none opacity-50" : ""
        }`}
        aria-disabled={nextDisabled}
      >
        →
      </Link>
    </div>
  );
}
