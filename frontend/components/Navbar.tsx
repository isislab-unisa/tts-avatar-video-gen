import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-t border-b border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-black">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="cursor-pointer text-base font-bold md:text-2xl hover:opacity-80 transition-opacity">
            DUBME
          </span>
        </Link>
      </div>
      {/* <button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
        Lingua
      </button> */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </nav>
  );
};
