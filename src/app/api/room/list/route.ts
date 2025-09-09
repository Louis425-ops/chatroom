import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { RoomListRes, ApiResponse, RoomPreviewInfo } from '@/types';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Authentication required',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    // Get all rooms with their latest message
    const rooms = await prisma.room.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            sender: true,
            roomId: true,
            time: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to match the expected interface
    const roomPreviewInfos: RoomPreviewInfo[] = rooms.map(room => ({
      roomId: room.id.toString(),
      roomName: room.name,
      lastMessage: room.messages.length > 0 ? {
        messageId: room.messages[0].id.toString(),
        roomId: room.messages[0].roomId.toString(),
        sender: room.messages[0].sender,
        content: room.messages[0].content,
        time: Number(room.messages[0].time),
      } : null,
    }));

    return NextResponse.json<ApiResponse<RoomListRes>>({
      message: 'Rooms retrieved successfully',
      code: 0,
      data: { rooms: roomPreviewInfos },
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}