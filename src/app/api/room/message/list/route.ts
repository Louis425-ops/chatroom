import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { RoomMessageListRes, ApiResponse, Message } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Authentication required',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const roomIdParam = url.searchParams.get('roomId');

    if (!roomIdParam) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Room ID is required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    const roomId = parseInt(roomIdParam);
    if (isNaN(roomId)) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Invalid room ID',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Room not found',
        code: 404,
        data: null,
      }, { status: 404 });
    }

    // Get all messages for the room
    const messages = await prisma.message.findMany({
      where: { roomId: roomId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        sender: true,
        roomId: true,
        time: true,
      },
    });

    // Transform the data to match the expected interface
    const messageList: Message[] = messages.map(message => ({
      messageId: message.id.toString(),
      roomId: message.roomId.toString(),
      sender: message.sender,
      content: message.content,
      time: Number(message.time),
    }));

    return NextResponse.json<ApiResponse<RoomMessageListRes>>({
      message: 'Messages retrieved successfully',
      code: 0,
      data: { messages: messageList },
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}