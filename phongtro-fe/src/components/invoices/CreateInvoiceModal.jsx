import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { invoiceService } from '../../api/invoiceService';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const serviceItemSchema = z.object({
  description: z.string().min(1, 'Tên dịch vụ'),
  amount: z.number().positive('Số tiền > 0'),
});

const invoiceSchema = z.object({
  electricityAmount: z.number().min(0, 'Tiền điện không âm'),
  waterAmount: z.number().min(0, 'Tiền nước không âm'),
  rentAmount: z.number().positive('Tiền phòng > 0'),
  services: z.array(serviceItemSchema).optional(),
}).refine(data => data.electricityAmount + data.waterAmount + data.rentAmount + (data.services?.reduce((s, i) => s + i.amount, 0) || 0) > 0, {
  message: 'Tổng tiền hóa đơn phải lớn hơn 0',
});

export const CreateInvoiceModal = ({ isOpen, onClose, roomId, roomPrice, month, year }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      electricityAmount: 0,
      waterAmount: 0,
      rentAmount: roomPrice,
      services: [],
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'services' });

  const onSubmit = async (data) => {
    try {
      // Tạo hóa đơn chính (nếu backend hỗ trợ gửi đồng thời điện, nước, dịch vụ)
      // Giả sử có API tạo hóa đơn đầy đủ
      await invoiceService.generateFullInvoice({
        roomId,
        month,
        year,
        electricityAmount: data.electricityAmount,
        waterAmount: data.waterAmount,
        rentAmount: data.rentAmount,
        services: data.services,
      });
      toast.success('Tạo hóa đơn thành công');
      queryClient.invalidateQueries(['invoices', roomId]);
      onClose();
    } catch (err) {
      toast.error('Lỗi tạo hóa đơn');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Tạo hóa đơn">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Tiền điện (VNĐ)" type="number" {...register('electricityAmount', { valueAsNumber: true })} error={errors.electricityAmount?.message} />
        <Input label="Tiền nước (VNĐ)" type="number" {...register('waterAmount', { valueAsNumber: true })} error={errors.waterAmount?.message} />
        <Input label="Tiền phòng (VNĐ)" type="number" {...register('rentAmount', { valueAsNumber: true })} error={errors.rentAmount?.message} />

        <div>
          <label className="block text-sm font-medium mb-1">Dịch vụ khác</label>
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <Input placeholder="Tên dịch vụ" {...register(`services.${idx}.description`)} className="flex-1" />
              <Input type="number" placeholder="Số tiền" {...register(`services.${idx}.amount`, { valueAsNumber: true })} className="w-32" />
              <button type="button" onClick={() => remove(idx)} className="text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', amount: 0 })}>
            <Plus size={14} /> Thêm dịch vụ
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit">Tạo hóa đơn</Button>
        </div>
      </form>
    </Dialog>
  );
};