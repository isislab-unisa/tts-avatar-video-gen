// app/(no-nav)/dashboard/project/create/page.tsx
import { listDirectoriesForUser } from "../../_actions/directories";
import CreateProjectForm from "@/components/CreateProjectForm";
import { getApiTokenAction } from "../_actions.token"; // ⟵ server action

export default async function CreateProjectPage() {
  const directories = await listDirectoriesForUser();
  // Passo la server action come prop
  return (
    <CreateProjectForm
      directories={directories}
      getApiToken={getApiTokenAction}
    />
  );
}
