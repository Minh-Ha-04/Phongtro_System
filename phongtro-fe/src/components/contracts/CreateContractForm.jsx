import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { tenantService } from '../../api/tenantService';
import { contractService } from '../../api/contractService';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const schema = z.object({
  // tenant info
  name: z.string().min(1, 'Tên khách thuê bắt buộc'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  identityNumber: z.string().optional(),
  // contract info
  startDate: z.string().min(1, 'Ngày bắt đầu bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc bắt buộc'),
  deposit: z.number().min(0, 'Tiền cọc không âm'),
  totalAmount: z.number().positive('Tổng tiền hợp đồng phải > 0'),
  note: z.string().optional(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate'],
});

export const CreateContractForm = ({ roomId, onSuccess }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: new Date().toISOString().slice(0,10),
      endDate: '',
      deposit: 0,
      totalAmount: 0,
    }
  });

  const onSubmit = async (data) => {
    try {
      // 1. Tạo tenant mới
      const tenantRes = await tenantService.create({
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        identityNumber: data.identityNumber,
      });
      // 2. Tạo contract
      await contractService.create({
        roomId,
        tenantId: tenantRes.data.id,
        startDate: data.startDate,
        endDate: data.endDate,
        totalAmount: data.totalAmount,
        deposit: data.deposit,
        note: data.note,
        status: 'ACTIVE',
      });
      toast.success('Tạo hợp đồng thành công');
      queryClient.invalidateQueries(['contracts']);
      queryClient.invalidateQueries(['rooms']);
      onSuccess();
    } catch (err) {
      toast.error('Lỗi tạo hợp đồng');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="font-semibold text-lg">Thông tin khách thuê</h3>
      <Input label="Họ tên *" {...register('name')} error={errors.name?.message} />
      <Input label="Số điện thoại" {...register('phone')} />
      <Input label="Email" {...register('email')} error={errors.email?.message} />
      <Input label="Địa chỉ" {...register('address')} />
      <Input label="CCCD/CMND" {...register('identityNumber')} />
      <h3 className="font-semibold text-lg mt-2">Thông tin hợp đồng</h3>
      <Input label="Ngày bắt đầu *" type="date" {...register('startDate')} error={errors.startDate?.message} />
      <Input label="Ngày kết thúc *" type="date" {...register('endDate')} error={errors.endDate?.message} />
      <Input label="Tiền cọc (VNĐ)" type="number" {...register('deposit', { valueAsNumber: true })} error={errors.deposit?.message} />
      <Input label="Tổng tiền hợp đồng (VNĐ) *" type="number" {...register('totalAmount', { valueAsNumber: true })} error={errors.totalAmount?.message} />
      <Input label="Ghi chú" {...register('note')} />
      <Button type="submit" variant="primary" className="w-full">Lưu hợp đồng</Button>
    </form>
  );
};