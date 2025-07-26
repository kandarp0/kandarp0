export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  created_at: string;
}

export interface Room {
  id: string;
  office_id: string;
  name: string;
  capacity: number;
  description?: string;
  created_at: string;
  office?: Office;
  room_services?: RoomService[];
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface RoomService {
  id: string;
  room_id: string;
  service_id: string;
  service?: Service;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  user?: User;
  room?: Room;
}

export interface BookingFormData {
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}