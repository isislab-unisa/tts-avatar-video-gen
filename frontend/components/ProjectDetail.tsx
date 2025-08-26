// components/ProjectDetail.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, Plus } from "lucide-react";
import type { ProjectDTO } from "@/app/(no-nav)/dashboard/project/[projectId]/_actions";

export default function ProjectDetail({
  project,
  directories,
  onRename,
  onDelete,
  onMove,
  onDownload,
}: {
  project: ProjectDTO | null;
  directories: { id: string; name: string }[];
  onRename?: () => void;
  onDelete?: () => void;
  onMove?: (dirId: string) => void;
  onDownload?: () => void;
}) {
  if (!project) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-center px-4">
        <p className="text-muted-foreground">Progetto non trovato.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Video: responsive, nessun overflow */}
      <div className="rounded-2xl overflow-hidden bg-black">
        <div className="w-full aspect-video">
          <video
            src={project.downloadUrl}
            controls
            preload="metadata"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Pannello info */}
      <div className="space-y-4 min-w-0">
        <div className="space-y-2 min-w-0">
          <h2 className="text-xl font-semibold break-words">{project.title}</h2>
          <div className="text-sm text-muted-foreground">
            Avatar: {project.avatar}
          </div>
          <p className="whitespace-pre-wrap break-words text-sm">
            {project.text}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          <Button onClick={onDownload} className="min-w-[140px]" type="button">
            Download
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="min-w-[140px]" type="button">
                Sposta in…
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 z-50">
              {directories.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    onMove?.(d.id);
                  }}
                >
                  <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{d.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-not-allowed opacity-50">
                <Plus className="mr-2 h-4 w-4" />
                <span>Crea nuova cartella… (presto)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={onRename} type="button">
            Rinomina
          </Button>
          <Button variant="destructive" onClick={onDelete} type="button">
            Elimina
          </Button>
        </div>

        <Separator />
      </div>
    </div>
  );
}
