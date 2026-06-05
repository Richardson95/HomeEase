import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { ListingCard } from '@/components/ListingCard'
import { PageHeader, EmptyState } from '@/components/common'
import { HeartIcon } from '@/components/icons'

export default function Saved() {
  const user = useStore((s) => s.currentUser())!
  const saved = useStore((s) => s.saved)
  const properties = useStore((s) => s.properties)

  const mine = saved
    .filter((x) => x.userId === user.id)
    .map((x) => properties.find((p) => p.id === x.propertyId))
    .filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <div className="container-wide">
      <PageHeader title="Saved listings" subtitle={`${mine.length} home${mine.length !== 1 ? 's' : ''} you're keeping an eye on`} back={false} />
      {mine.length === 0 ? (
        <EmptyState icon={<HeartIcon className="h-7 w-7" />} title="No saved homes yet" body="Tap the heart on any listing to save it here for later." action={<Link to="/search" className="btn-primary">Browse homes</Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((p) => <ListingCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  )
}
