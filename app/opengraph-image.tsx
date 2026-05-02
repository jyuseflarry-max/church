import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Fulshear Church of Christ — A welcoming community of faith in Fulshear, TX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const tagline = "A Welcoming Community of Faith";

  const [logoData, playfairData] = await Promise.all([
    readFile(join(process.cwd(), "public/logo.png"), "base64"),
    readFile(join(process.cwd(), "app/fonts/PlayfairDisplay-Bold.ttf")),
  ]);
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #FAF9F6 0%, #F4F1EB 55%, #E5EFEB 100%)",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Top accent bar — sage → rose, mirroring the logo palette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background:
              "linear-gradient(90deg, #2F5247 0%, #6B9489 55%, #C97A7C 100%)",
          }}
        />

        {/* Logo */}
        <img
          src={logoSrc}
          width={340}
          height={286}
          alt=""
          style={{ marginBottom: 40 }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 64,
            color: "#2F5247",
            fontFamily: "Playfair Display",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 44,
          }}
        >
          {tagline}
        </div>

        {/* Service times pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            background: "#FFFFFF",
            border: "2px solid #E5EFEB",
            borderRadius: 9999,
            padding: "16px 36px",
            color: "#2F5247",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          <span>Sundays · 9:00 Bible Class</span>
          <span style={{ color: "#9CBCB3" }}>•</span>
          <span>10:00 Worship</span>
        </div>

        {/* Bottom-right URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 48,
            display: "flex",
            color: "#6B9489",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          fulshearcoc.org
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
