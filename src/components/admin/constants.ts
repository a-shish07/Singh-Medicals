import type { OrderStatus } from '../../types';

export const STATUS_STYLES: Record<OrderStatus, string> = {
  Submitted: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-purple-100 text-purple-700',
  Dispatched: 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export const ALL_STATUSES: OrderStatus[] = ['Submitted', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];