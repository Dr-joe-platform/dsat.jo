import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ImgBB API key not configured" }, { status: 500 });
    }

    // Create a new FormData object to send to ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await res.json();
    
    if (data.success) {
      return NextResponse.json({ success: true, url: data.data.url });
    } else {
      return NextResponse.json({ error: data.error?.message || "ImgBB upload failed" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("API Upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
