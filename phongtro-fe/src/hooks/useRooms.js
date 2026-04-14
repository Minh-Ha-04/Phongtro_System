import { useQuery } from "@tanstack/react-query";
import { roomService } from "../api/roomService";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: roomService.getAll,
  });
};