import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Room, BookingFormData } from '../../types';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const bookingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

interface BookingModalProps {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal = ({ room, onClose, onSuccess }: BookingModalProps) => {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    }
  });

  const startTime = watch('start_time');
  const endTime = watch('end_time');

  const checkAvailability = async (start: string, end: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room.id)
      .eq('status', 'confirmed')
      .or(`and(start_time.lte.${start},end_time.gt.${start}),and(start_time.lt.${end},end_time.gte.${end}),and(start_time.gte.${start},end_time.lte.${end})`);
    
    return { available: !error && data.length === 0, error };
  };

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    
    // Check availability
    const { available, error: availabilityError } = await checkAvailability(data.start_time, data.end_time);
    
    if (availabilityError) {
      toast.error('Error checking availability');
      setLoading(false);
      return;
    }
    
    if (!available) {
      toast.error('Room is not available for the selected time slot');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .insert({
        room_id: room.id,
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        status: 'confirmed'
      });

    if (error) {
      toast.error('Error creating booking');
    } else {
      toast.success('Room booked successfully!');
      onSuccess();
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Book {room.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Meeting Title"
            placeholder="Enter meeting title"
            {...register('title')}
            error={errors.title?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              placeholder="Enter meeting description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <Input
            label="Start Time"
            type="datetime-local"
            {...register('start_time')}
            error={errors.start_time?.message}
          />

          <Input
            label="End Time"
            type="datetime-local"
            {...register('end_time')}
            error={errors.end_time?.message}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Booking...' : 'Book Room'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};