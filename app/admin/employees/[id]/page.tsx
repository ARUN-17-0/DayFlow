import { EditEmployeeClient } from '@/components/dayflow/admin/EditEmployeeClient'

export function generateStaticParams() {
  return [
    { id: 'EMP001' },
    { id: 'EMP002' },
    { id: 'EMP003' },
    { id: 'EMP004' },
    { id: 'EMP005' },
    { id: 'EMP006' },
    { id: 'EMP007' },
    { id: 'EMP008' },
  ]
}

export default function EditEmployeePage() {
  return <EditEmployeeClient />
}
