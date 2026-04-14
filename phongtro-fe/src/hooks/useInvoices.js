import { useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../api/invoiceService';
import { useRooms } from './useRooms';

export const useInvoices = (roomId) => {
  const queryClient = useQueryClient();
  const { data: roomsData } = useRooms();
  const rooms = roomsData?.data || [];

  // ✅ FIX: useQuery v5 + gọi top-level
  const invoicesQuery = useQuery({
    queryKey: ['invoices', roomId],
    queryFn: () => invoiceService.getByRoom(roomId),
    enabled: !!roomId,
  });

  // ✅ lấy hóa đơn mới nhất
  const getLatestInvoiceByRoom = () => {
    const data = invoicesQuery.data;
    if (!data?.data) return null;

    const sorted = [...data.data].sort(
      (a, b) => b.year - a.year || b.month - a.month
    );

    return sorted[0];
  };

  // ✅ doanh thu
  const getRevenueByRoom = (month, year) => {
    const revenues = [];

    rooms.forEach((room) => {
      const invoices =
        queryClient.getQueryData(['invoices', room.id])?.data?.data || [];

      const invoice = invoices.find(
        (inv) =>
          inv.month === month &&
          inv.year === year &&
          inv.status === 'PAID'
      );

      if (invoice) {
        revenues.push({
          roomNumber: room.roomNumber,
          revenue: invoice.totalAmount,
        });
      }
    });

    return revenues;
  };

  return {
    invoicesQuery, // 👈 trả về query luôn
    getLatestInvoiceByRoom,
    getRevenueByRoom,
  };
};