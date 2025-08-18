import { getDirectoriesForPage } from "../_actions";
import CreateProjectForm from "@/components/CreateProjectForm";

export default async function Page() {
  const directories = await getDirectoriesForPage(); // [{id,name}]
  return <CreateProjectForm directories={directories} />;
}
