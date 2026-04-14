import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RoomList } from '../components/rooms/RoomList';
import { RoomDetailPanel } from '../components/rooms/RoomDetailPanel';
import { useRooms } from '../hooks/useRooms';

export default function Dashboard() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const queryClient = useQueryClient();
  const { data: roomsData } = useRooms();
  const selectedRoom = roomsData?.data?.find(r => r.id === selectedRoomId);

  const refresh = () => {
    queryClient.invalidateQueries(['rooms']);
    queryClient.invalidateQueries(['contracts']);
    if (selectedRoomId) queryClient.invalidateQueries(['invoices', selectedRoomId]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cột trái: danh sách phòng */}
      <div className="lg:col-span-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold mb-3">Danh sách phòng</h2>
          <RoomList selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
        </div>
      </div>
      {/* Cột phải: chi tiết phòng */}
      <div className="lg:col-span-8">
        {selectedRoom ? (
          <RoomDetailPanel
            room={selectedRoom}
            month={currentMonth}
            year={currentYear}
            onRefresh={refresh}
          />
        ) : (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
            Chọn một phòng từ danh sách để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
}