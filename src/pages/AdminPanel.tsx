import { useState, useEffect } from 'react';
import { Users, Calendar, Building } from 'lucide-react';
import { Booking, Room, Office } from '../types';
import { supabase } from '../lib/supabase';
import { BookingCard } from '../components/booking/BookingCard';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const AdminPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all bookings with user and room data
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        user:profiles(*),
        room:rooms(
          *,
          office:offices(*)
        )
      `)
      .eq('status', 'confirmed')
      .order('start_time');

    // Fetch rooms and offices for statistics
    const { data: roomsData } = await supabase
      .from('rooms')
      .select('*');
      
    const { data: officesData } = await supabase
      .from('offices')
      .select('*');

    if (bookingsData) setBookings(bookingsData);
    if (roomsData) setRooms(roomsData);
    if (officesData) setOffices(officesData);
    
    setLoading(false);
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedOffice === 'all') return true;
    return booking.room?.office_id === selectedOffice;
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

  const upcomingBookings = filteredBookings.filter(
    booking => new Date(booking.end_time) >= new Date()
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offices</p>
                <p className="text-2xl font-bold text-gray-900">{offices.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bookings Management */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
            
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
          </div>

          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No bookings found</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  showUser={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};