import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Upload to ImgBB (free image hosting)
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'photo.jpg');

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY || ''}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const uploadData = await uploadResponse.json();

    if (uploadData.success && uploadData.data?.url) {
      return NextResponse.json({ 
        success: true, 
        imageUrl: uploadData.data.url 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
