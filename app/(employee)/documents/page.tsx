'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { FileText, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const [documents] = useState([
    { id: '1', name: 'Offer Letter.pdf', type: 'OFFER_LETTER', date: '01/06/2022', size: '1.2 MB' },
    { id: '2', name: 'Employment Contract.pdf', type: 'CONTRACT', date: '01/06/2022', size: '2.4 MB' },
    { id: '3', name: 'Aadhaar Card Copy.pdf', type: 'ID_PROOF', date: '05/06/2022', size: '850 KB' },
  ])

  const handleDownload = (doc: typeof documents[0]) => {
    toast.success(`Opening ${doc.name}...`)
    window.open(`/api/documents/download?type=${doc.type}`, '_blank')
  }

  const handleUpload = () => {
    toast.info('Select a file to upload to your document vault')
  }

  return (
    <PageTransition>
      <PageHeader
        title="Documents Vault"
        description="Access and download your official employment records and contract documents."
        actions={
          <button
            onClick={handleUpload}
            className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0 border border-purple-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-0.5">{doc.name}</h4>
                <p className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded inline-block border border-purple-100">{doc.type} • {doc.size}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Uploaded {doc.date}</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(doc)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 border border-slate-200 transition-colors flex items-center gap-1 font-bold text-xs"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-purple-700" />
            </button>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}
