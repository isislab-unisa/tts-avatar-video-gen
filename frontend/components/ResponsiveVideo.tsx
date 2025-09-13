"use client";

type Props = {
  src: string;
  poster?: string;
  className?: string;
};

export default function ResponsiveVideo({ src, poster, className }: Props) {
  return (
    <div
      className={`relative aspect-video w-full max-w-[720px] rounded-2xl overflow-hidden bg-black ${
        className ?? ""
      }`}
    >
      <video
        src={src}
        controls
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
        poster={poster}
      />
    </div>
  );
}
