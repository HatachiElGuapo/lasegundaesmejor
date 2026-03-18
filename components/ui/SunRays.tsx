export default function SunRays() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          'repeating-conic-gradient(from 0deg at 0% 0%, rgba(180, 130, 255, 0.35) 0deg 6deg, rgba(0,0,0,0) 6deg 18deg)',
      }}
    />
  );
}
