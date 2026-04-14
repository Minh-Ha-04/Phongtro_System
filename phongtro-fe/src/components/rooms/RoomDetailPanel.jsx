import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CreateContractForm } from '../contracts/CreateContractForm';
import { CreateInvoiceModal } from '../invoices/CreateInvoiceModal';
import { useContracts } from '../../hooks/useContracts';
import { useInvoices } from '../../hooks/useInvoices';
import { format } from 'date-fns';
import { User, FileText, Calendar, DollarSign, CreditCard, Home } from 'lucide-react';

export const RoomDetailPanel = ({ room, month, year, onRefresh }) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const { getActiveContractByRoom } = useContracts();
  const { getInvoicesByRoom } = useInvoices();
  const activeContract = getActiveContractByRoom(room.id);
  const hasTenant = !!activeContract;
  const { data: invoicesData } = getInvoicesByRoom(room.id);
  const currentInvoice = invoicesData?.data?.find(inv => inv.month === month && inv.year === year);

  if (!room) return null;

  return (
    <Card className="h-full border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Home size={24} /> {room.roomNumber}
        </h2>
        <div className="flex gap-3 mt-1">
          <Badge variant={hasTenant ? 'success' : 'default'} className="bg-white/20 text-white">
            {hasTenant ? 'Đang thuê' : 'Trống'}
          </Badge>
          <span className="text-sm opacity-90">{room.area}m² | Tầng {room.floor}</span>
        </div>
        <p className="text-2xl font-bold mt-2">{room.rentPrice.toLocaleString()} đ/tháng</p>
      </div>
      <CardContent className="p-6 space-y-6">
        {hasTenant ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3"><User size={18} /> Thông tin khách thuê</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Họ tên:</span> {activeContract.tenant?.name || 'N/A'}</p>
                  <p><span className="font-medium">SĐT:</span> {activeContract.tenant?.phone || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {activeContract.tenant?.email || 'N/A'}</p>
                  <p><span className="font-medium">CCCD:</span> {activeContract.tenant?.identityNumber || 'N/A'}</p>
                  <p><span className="font-medium">Ngày thuê:</span> {format(new Date(activeContract.startDate), 'dd/MM/yyyy')}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3"><FileText size={18} /> Hợp đồng</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Mã hợp đồng:</span> #{activeContract.id}</p>
                  <p><span className="font-medium">Ngày bắt đầu:</span> {format(new Date(activeContract.startDate), 'dd/MM/yyyy')}</p>
                  <p><span className="font-medium">Ngày kết thúc:</span> {format(new Date(activeContract.endDate), 'dd/MM/yyyy')}</p>
                  <p><span className="font-medium">Tiền cọc:</span> {(activeContract.deposit || 0).toLocaleString()} đ</p>
                  <p><span className="font-medium">Ghi chú:</span> {activeContract.note || 'Không'}</p>
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={() => setShowInvoiceModal(true)} className="w-full py-3 text-base shadow-md">
              <CreditCard size={18} className="mr-2" /> Tạo hóa đơn tháng {month}/{year}
            </Button>
            {currentInvoice && currentInvoice.status !== 'PAID' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-yellow-700 text-sm">
                ⚠️ Hóa đơn tháng {month}/{year} chưa thanh toán.
              </div>
            )}
          </>
        ) : (
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4">➕ Tạo hợp đồng thuê phòng</h3>
            <CreateContractForm roomId={room.id} onSuccess={onRefresh} />
          </div>
        )}
      </CardContent>
      <CreateInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        roomId={room.id}
        roomPrice={room.rentPrice}
        month={month}
        year={year}
      />
    </Card>
  );
};