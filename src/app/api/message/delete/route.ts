import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/types';

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

    const { messageId }: { messageId: string } = await request.json();

    if (!messageId) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Message ID is required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!message) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Message not found',
        code: 404,
        data: null,
      }, { status: 404 });
    }

    // Check permissions: only root user or message sender can delete the message
    const canDelete = currentUser.isRoot || message.sender === currentUser.username;

    if (!canDelete) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'You can only delete your own messages',
        code: 403,
        data: null,
      }, { status: 403 });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: parseInt(messageId) },
    });

    return NextResponse.json<ApiResponse<null>>({
      message: 'Message deleted successfully',
      code: 0,
      data: null,
    });

  } catch (error) {
    console.error('Message deletion error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}