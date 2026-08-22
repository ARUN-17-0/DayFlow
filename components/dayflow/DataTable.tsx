'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

export type Column<T> = {
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  page?: number
  totalPages?: number
  onPageChange?: (newPage: number) => void
  totalCount?: number
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  page = 1,
  totalPages = 1,
  onPageChange,
  totalCount,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-df-border overflow-hidden p-4 space-y-3">
        <div className="h-8 bg-mist-grey rounded-lg skeleton-shimmer w-full mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-df-border/50">
            <div className="h-4 bg-mist-grey rounded skeleton-shimmer flex-1" />
            <div className="h-4 bg-mist-grey rounded skeleton-shimmer w-24" />
            <div className="h-4 bg-mist-grey rounded skeleton-shimmer w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-df-border p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-lavender flex items-center justify-center mx-auto mb-3 text-royal-purple">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-charcoal text-base mb-1">{emptyTitle}</h3>
        <p className="text-xs text-zinc-grey max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-mist-grey/60 border-b border-df-border">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold text-zinc-grey uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-df-border/60">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                className="hover:bg-cool-grey/60 transition-colors text-xs text-charcoal"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-4 py-3.5 ${col.className || ''}`}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t border-df-border bg-mist-grey/30 flex items-center justify-between text-xs text-zinc-grey">
          <div>
            Showing <span className="font-semibold text-charcoal">{data.length}</span>
            {totalCount ? ` of ${totalCount}` : ''} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-df-border bg-white text-charcoal hover:bg-mist-grey disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-charcoal">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-df-border bg-white text-charcoal hover:bg-mist-grey disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
