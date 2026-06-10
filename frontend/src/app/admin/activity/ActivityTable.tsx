"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";



type Props = {
  data: Activity[];
};

export default function RecentActivitiesTable({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          
          {/* Head */}
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-accent/20 transition"
              >
                <TableCell className="font-medium">
                  {item.name}
                </TableCell>

                <TableCell>
                  <span className="px-2 py-1 rounded-md bg-muted text-xs">
                    {item.activity_type}
                  </span>
                </TableCell>

                <TableCell>{item.title}</TableCell>

                <TableCell className="text-muted-foreground">
                  {item.description || "-"}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </div>
    </div>
  );
}