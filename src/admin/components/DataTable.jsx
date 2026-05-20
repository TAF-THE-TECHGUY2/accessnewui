import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";

const buildPageItems = (pageCount, pageIndex) => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  if (pageIndex <= 3) {
    return [0, 1, 2, 3, 4, "ellipsis-right", pageCount - 1];
  }

  if (pageIndex >= pageCount - 4) {
    return [
      0,
      "ellipsis-left",
      pageCount - 5,
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
    ];
  }

  return [
    0,
    "ellipsis-left",
    pageIndex - 1,
    pageIndex,
    pageIndex + 1,
    "ellipsis-right",
    pageCount - 1,
  ];
};

function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  pageSize = 8,
  onRowClick,
  showFooter = false,
  containerClassName = "",
  headerClassName = "",
  headerCellClassName = "",
  bodyCellClassName = "",
  rowClassName = "",
  footerClassName = "",
}) {
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <LoadingState label="Loading table data..." />;
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle || "No records match these filters"}
        description={
          emptyDescription ||
          "Adjust your search terms or clear filters to widen the results."
        }
      />
    );
  }

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const startResult = data.length ? pageIndex * pageSize + 1 : 0;
  const endResult = Math.min((pageIndex + 1) * pageSize, data.length);
  const pageItems = buildPageItems(pageCount, pageIndex);

  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-black/5 bg-white ${containerClassName}`}
    >
      <div className="overflow-x-auto scrollbar-subtle">
        <table className="min-w-full divide-y divide-[#f1ebe3] text-sm">
          <thead className={`bg-[#faf6f1] ${headerClassName}`}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 ${headerCellClassName}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-[#f1ebe3] bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`transition duration-200 hover:bg-[#faf7f2] ${rowClassName} ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-2.5 align-middle text-sm text-slate-600 ${bodyCellClassName}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFooter || table.getPageCount() > 1 ? (
        <div
          className={`flex flex-col gap-3 border-t border-[#f1ebe3] px-4 py-3 text-xs text-gray-500 md:flex-row md:items-center md:justify-between ${footerClassName}`}
        >
          <p>
            Showing {startResult} to {endResult} of {data.length} results
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-[12px] border border-black/5 bg-[#faf6f1] px-3 py-2 transition duration-200 hover:bg-[#f3ede4] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="inline-flex items-center gap-1">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </span>
            </button>

            {pageItems.map((item) =>
              typeof item === "string" ? (
                <span key={item} className="px-1.5 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`min-w-9 rounded-[12px] border px-3 py-2 transition duration-200 ${
                    item === pageIndex
                      ? "border-[#123438] bg-[#123438] text-white"
                      : "border-black/5 bg-[#faf6f1] text-slate-600 hover:bg-[#f3ede4]"
                  }`}
                  onClick={() => table.setPageIndex(item)}
                >
                  {item + 1}
                </button>
              )
            )}

            <button
              type="button"
              className="rounded-[12px] border border-black/5 bg-[#faf6f1] px-3 py-2 transition duration-200 hover:bg-[#f3ede4] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="inline-flex items-center gap-1">
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DataTable;
