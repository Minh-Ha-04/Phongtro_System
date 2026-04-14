import { Badge } from '../ui/Badge';
import { MapPin, Maximize2, DollarSign } from 'lucide-react';

export const RoomCard = ({ room, isSelected, onClick, status }) => {
  const statusConfig = {
    'Đang thuê': { label: 'Đang thuê', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    'Trống': { label: 'Trống', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const currentStatus = statusConfig[status] || statusConfig['Trống'];

  return (
    <div
      onClick={() => onClick(room.id)}
      className={`group p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{room.roomNumber}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><Maximize2 size={14} />{room.area}m²</span>
            <span className="flex items-center gap-1"><MapPin size={14} />Tầng {room.floor}</span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
          {currentStatus.label}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1 text-blue-600 font-semibold">
        <DollarSign size={16} />
        <span>{room.rentPrice.toLocaleString()} đ/tháng</span>
      </div>
    </div>
  );
};