'use client';

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  postedDate: string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
}

interface UserListingCardProps {
  listing: Listing;
  onPromote: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function UserListingCard({
  listing,
  onPromote,
  onEdit,
  onDelete
}: UserListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('az-AZ').format(price);
  };

  const imageUrl = listing.imageUrl || '/placeholder-product.jpg';

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white shadow-sm border border-gray-200 p-4">
      {/* Status Badge */}
      {listing.status === 'rejected' && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
          <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
          <span className="text-red-600 text-xs font-semibold">Rədd edilmiş</span>
        </div>
      )}
      {listing.status === 'pending' && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="material-symbols-outlined text-yellow-600 text-sm">schedule</span>
          <span className="text-yellow-700 text-xs font-semibold">Gözləmədə</span>
        </div>
      )}

      {/* Image */}
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg bg-gray-100"
        style={{ 
          backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
        }}
        role="img"
        aria-label={listing.title}
      >
        {!imageUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400 text-4xl">image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-900 text-lg font-bold leading-tight">
          {listing.title}
        </p>
        <p className="text-gray-500 text-sm font-normal leading-normal">
          {listing.location}
        </p>
        <p className="text-2xl font-black text-primary">
          {formatPrice(listing.price)} AZN
        </p>
      </div>

      {/* Posted Date */}
      <p className="text-gray-500 text-xs font-normal leading-normal">
        Yerləşdirilib: {listing.postedDate}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
        {listing.status === 'active' && (
          <button
            onClick={() => onPromote(listing.id)}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-9 px-3 bg-primary/10 text-primary text-sm font-medium leading-normal hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-base">rocket_launch</span>
            <span className="truncate">Önə Çıxar</span>
          </button>
        )}
        {listing.status !== 'active' && <div />}

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(listing.id)}
            className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Redaktə et"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>

          <button
            onClick={() => onDelete(listing.id)}
            className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Sil"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
