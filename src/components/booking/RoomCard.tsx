import { Room } from '../../types';
import { Users, Projector, Video, PenTool } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

const serviceIcons: Record<string, any> = {
  projector: Projector,
  video_conferencing: Video,
  whiteboard: PenTool,
};

export const RoomCard = ({ room, onBook }: RoomCardProps) => {
  return (
    <Card hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
          <p className="text-sm text-gray-600">{room.office?.name}</p>
        </div>
        <div className="flex items-center text-gray-500">
          <Users className="w-4 h-4 mr-1" />
          <span className="text-sm">{room.capacity}</span>
        </div>
      </div>

      {room.description && (
        <p className="text-gray-600 text-sm mb-4">{room.description}</p>
      )}

      {room.room_services && room.room_services.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {room.room_services.map((roomService) => {
            const service = roomService.service;
            if (!service) return null;
            
            const IconComponent = serviceIcons[service.icon] || PenTool;
            return (
              <div
                key={roomService.id}
                className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {service.name}
              </div>
            );
          })}
        </div>
      )}

      <Button
        onClick={() => onBook(room)}
        className="w-full"
      >
        Book Room
      </Button>
    </Card>
  );
};