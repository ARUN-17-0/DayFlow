'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { EmptyState } from '@/components/dayflow/EmptyState'
import { FileText, Download, Upload, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([
    { id: '1', name: 'Offer Letter.pdf', type: 'OFFER_LETTER', date: '01/06/2022', size: '1.2 MB' },
    { id: '2', name: 'Employment Contract.pdf', type: 'CONTRACT', date: '01/06/2022', size: '2.4 MB' },
    { id: '3', name: 'Aadhaar Card Copy.pdf', type: 'ID_PROOF', date: '05/06/2022', size: '850 KB' },
  ])

  const handleUpload = () => {
    toast.info('Select a file to upload to your document vault')
  }

  return (
    <PageTransition>
      <PageHeader
        title="Documents Vault"
        description="Access and download your employment records and official documents."
        actions={
          <button
            onClick={handleUpload}
            className="bg-royal-purple text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl p-5 border border-df-border shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-royal-purple flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-charcoal text-xs mb-0.5">{doc.name}</h4>
                <p className="text-[11px] text-zinc-grey">{doc.type} • {doc.size}</p>
                <p className="text-[10px] text-zinc-grey mt-1">Uploaded {doc.date}</p>
              </div>
            </div>
            <button
              onClick={() => toast.success(`Downloading ${doc.name}...`)}
              className="p-2 rounded-lg bg-cool-grey hover:bg-mist-grey text-charcoal transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}
