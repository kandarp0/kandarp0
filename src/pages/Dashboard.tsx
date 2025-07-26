import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Room, Booking, Office } from '../types';
import { supabase } from '../lib/supabase';
import { RoomCard } from '../components/booking/RoomCard';
import { BookingModal } from '../components/booking/BookingModal';
import { BookingCard } from '../components/booking/BookingCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch offices
    const { data: officesData } = await supabase
      .from('offices')
      .select('*')
      .order('name');
    
    // Fetch rooms with related data
    const { data: roomsData } = await supabase
      .from('rooms')
      .select(`
        *,
        office:offices(*),
        room_services(
          *,
          service:services(*)
        )
      `)
      .order('name');
    
    // Fetch user's bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(
          *,
          office:offices(*)
        )
      `)
      .eq('status', 'confirmed')
      .gte('end_time', new Date().toISOString())
      .order('start_time');

    if (officesData) setOffices(officesData);
    if (roomsData) setRooms(roomsData);
    if (bookingsData) setBookings(bookingsData);
    
    setLoading(false);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesOffice = selectedOffice === 'all' || room.office_id === selectedOffice;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.office?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOffice && matchesSearch;
  });

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error('Error cancelling booking');
    } else {
      toast.success('Booking cancelled successfully');
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Bookings Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Upcoming Bookings</h2>
          {bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No upcoming bookings</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          )}
        </div>

        {/* Room Booking Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Available Rooms</h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Offices</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={setSelectedRoom}
              />
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No rooms found matching your criteria</p>
            </Card>
          )}
        </div>
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};