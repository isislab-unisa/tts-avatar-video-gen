import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { SortDropdown } from "@/components/sort-dropdown";
import {
  listDirectoriesForUser,
  type DirectoryDTO,
} from "./_actions/directories";
import {
  listAllProjectsAction,
  type ProjectListItem,
} from "./_actions/projects";

type SearchParams = Promise<{
  page?: string | string[];
  sort?: "createdAt" | "title" | string | string[];
  order?: "asc" | "desc" | string | string[];
  [k: string]: string | string[] | undefined;
}>;

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
  searchParams: SearchParams;
}) {
  // Await the search params promise
  const resolvedSearchParams = await searchParams;

  const sp = resolvedSearchParams ?? {};
  const page = Math.max(1, toIntOr(1, sp.page));
  const sort = asSort(sp.sort);
  const order = asOrder(sp.order);
  const limit = 8;

  const [directories, data] = await Promise.all([
    listDirectoriesForUser() as Promise<DirectoryDTO[]>,
    listAllProjectsAction(page, limit, sort, order),
  ]);

  const items: ProjectListItem[] = data.items ?? [];
  const total = data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <nav className="text-sm text-muted-foreground">Home</nav>

      <div className="flex justify-end">
        <SortDropdown
          basePath="/dashboard"
          currentSort={sort}
          currentOrder={order}
        />
      </div>

      <div className="min-h-[60vh]">
        {items.length === 0 ? (
          <div className="min-h-[40vh] grid place-items-center">
            <p className="text-muted-foreground">Nessun progetto trovato.</p>
          </div>
        ) : (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <li key={p.id}>
                <ProjectCard item={p} directories={directories} showFolder />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-center">
        <Pagination
          current={page}
          totalPages={totalPages}
          sort={sort}
          order={order}
        />
      </div>
    </div>
  );
}

function Pagination({
  current,
  totalPages,
  sort,
  order,
}: {
  current: number;
  totalPages: number;
  sort: "createdAt" | "title";
  order: "asc" | "desc";
}) {
  const href = (p: number) => {
    const qs = new URLSearchParams({ page: String(p), sort, order });
    return `/dashboard?${qs.toString()}`;
  };

  const prevDisabled = current <= 1;
  const nextDisabled = current >= totalPages;

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={prevDisabled ? "#" : href(current - 1)}
        className={`px-3 py-2 rounded-md border ${
          prevDisabled ? "pointer-events-none opacity-50" : ""
        }`}
        aria-disabled={prevDisabled}
      >
        ←
      </Link>
      <span className="text-sm">
        Pagina {current} di {totalPages}
      </span>
      <Link
        href={nextDisabled ? "#" : href(current + 1)}
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
