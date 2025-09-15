// app/(no-nav)/dashboard/project/create/page.tsx
import { listDirectoriesForUser } from "../../_actions/directories";
import CreateProjectForm from "@/components/CreateProjectForm";
import { getApiTokenAction } from "../_actions.token";

export default async function CreateProjectPage() {
  const directories = await listDirectoriesForUser();

  return (
    <CreateProjectForm
      directories={directories}
      getApiToken={getApiTokenAction}
    />
  );
}
