import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { RoomAddArgs, RoomAddRes, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Authentication required',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    const { user, roomName }: RoomAddArgs = await request.json();

    if (!user || !roomName) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'User and room name are required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Check if the user making the request matches the user in the request body
    if (user !== currentUser.username) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'You can only create rooms for yourself',
        code: 403,
        data: null,
      }, { status: 403 });
    }

    // Check if room name already exists
    const existingRoom = await prisma.room.findFirst({
      where: { name: roomName },
    });

    if (existingRoom) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Room name already exists',
        code: 409,
        data: null,
      }, { status: 409 });
    }

    // Create the room
    const room = await prisma.room.create({
      data: {
        name: roomName,
        createdBy: user,
      },
    });

    return NextResponse.json<ApiResponse<RoomAddRes>>({
      message: 'Room created successfully',
      code: 0,
      data: { roomId: room.id.toString() },
    });

  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}