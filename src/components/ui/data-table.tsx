
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps<TData> {
  columns: any[];
  data: TData[];
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={typeof column.header === 'string' ? column.header : column.id || column.accessorKey}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex}>
                    {column.cell 
                      ? column.cell({ row: { original: row } }) 
                      : column.accessorKey 
                        ? column.accessorKey.toString().includes('.') 
                          ? column.accessorKey.toString().split('.').reduce((obj, key) => obj?.[key] ?? null, row)
                          : (row as any)[column.accessorKey]
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
