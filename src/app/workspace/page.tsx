import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { WorkspaceProvider } from "@/providers/workspace-provider";

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
