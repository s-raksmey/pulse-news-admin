import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: 0, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Read metadata
    const meta = await sharp(buffer).metadata();

    // Decide resize width dynamically (NEVER upscale)
    const targetWidth =
      meta.width && meta.width > 1600 ? 1600 : meta.width;

    // Ensure upload directory
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = file.name.replace(/\s+/g, "-");
    const filename = `${Date.now()}-${safeName}`;
    const outputPath = path.join(uploadDir, filename);

    // ✅ Save image (preserve quality, downscale only)
    await sharp(buffer)
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 90,
        mozjpeg: true,
      })
      .toFile(outputPath);

    return NextResponse.json({
      success: 1,
      file: {
        url: `/uploads/${filename}`,
        width: meta.width,
        height: meta.height,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: 0, message: "Upload failed" },
      { status: 500 }
    );
  }
}
