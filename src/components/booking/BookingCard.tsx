import { Booking } from '../../types';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  showUser?: boolean;
}

export const BookingCard = ({ booking, onCancel, showUser = false }: BookingCardProps) => {
  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.title}</h3>
          {showUser && booking.user && (
            <p className="text-sm text-gray-600">by {booking.user.full_name}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            booking.status === 'confirmed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {booking.status}
          </span>
          {booking.status === 'confirmed' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel(booking.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {booking.description && (
        <p className="text-gray-600 text-sm mb-3">{booking.description}</p>
      )}
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{booking.room?.name} - {booking.room?.office?.name}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{format(startDate, 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>{format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}</span>
        </div>
      </div>
    </Card>
  );
};