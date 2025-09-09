import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { RoomDeleteArgs, ApiResponse } from '@/types';

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

    const { user, roomId }: RoomDeleteArgs = await request.json();

    if (!user || !roomId) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'User and room ID are required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!room) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Room not found',
        code: 404,
        data: null,
      }, { status: 404 });
    }

    // Check permissions: only the creator or root user can delete the room
    const canDelete = currentUser.isRoot || 
                     (room.createdBy === currentUser.username && user === currentUser.username);

    if (!canDelete) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'You can only delete rooms you created',
        code: 403,
        data: null,
      }, { status: 403 });
    }

    // Delete the room (messages will be deleted automatically due to cascade)
    await prisma.room.delete({
      where: { id: parseInt(roomId) },
    });

    return NextResponse.json<ApiResponse<null>>({
      message: 'Room deleted successfully',
      code: 0,
      data: null,
    });

  } catch (error) {
    console.error('Room deletion error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}