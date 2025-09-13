import Link from "next/link";

type PaginationProps = {
  current: number;
  totalPages: number;
  t: (key: string) => string;
  makeHref: (page: number) => string;
};

export default function Pagination({
  current,
  totalPages,
  t,
  makeHref,
}: PaginationProps) {
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
