import { useState, useMemo } from 'react';
import { RoomCard } from './RoomCard';
import { useRooms } from '../../hooks/useRooms';
import { useContracts } from '../../hooks/useContracts';
import { Search, Filter } from 'lucide-react';

export const RoomList = ({ selectedRoomId, onSelectRoom }) => {
  const { data: roomsData, isLoading } = useRooms();
  const { getActiveContractByRoom } = useContracts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const rooms = roomsData?.data || [];

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.roomNumber.toLowerCase().includes(search.toLowerCase());
      const activeContract = getActiveContractByRoom(room.id);
      const status = activeContract ? 'Đang thuê' : 'Trống';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter, getActiveContractByRoom]);

  if (isLoading) return <div className="py-10 text-center text-gray-400">Đang tải...</div>;

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Tất cả</option>
            <option value="Đang thuê">Đang thuê</option>
            <option value="Trống">Trống</option>
          </select>
        </div>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {filteredRooms.map(room => {
          const activeContract = getActiveContractByRoom(room.id);
          const status = activeContract ? 'Đang thuê' : 'Trống';
          return (
            <RoomCard
              key={room.id}
              room={room}
              status={status}
              isSelected={selectedRoomId === room.id}
              onClick={onSelectRoom}
            />
          );
        })}
        {filteredRooms.length === 0 && (
          <div className="text-center py-10 text-gray-400">Không tìm thấy phòng</div>
        )}
      </div>
    </div>
  );
};