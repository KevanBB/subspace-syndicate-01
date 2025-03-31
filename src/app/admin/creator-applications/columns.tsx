import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export type Application = {
  id: string;
  user_id: string;
  full_name: string;
  status: string;
  submitted_at: string;
  profiles: {
    username: string;
  };
};

export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "profiles.username",
    header: "Username",
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted",
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.submitted_at), {
        addSuffix: true,
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "pending_application"
              ? "secondary"
              : status === "approved"
              ? "default"
              : "destructive"
          }
        >
          {status === "pending_application"
            ? "Pending"
            : status === "approved"
            ? "Approved"
            : "Denied"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/creator-applications/${row.original.id}`}>
            Review
          </Link>
        </Button>
      );
    },
  },
]; 