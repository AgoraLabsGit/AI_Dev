export function VibeLabLogo({ size = 40 }: { size?: number }) {
  return (
    <img 
      src="/assets/brand/VibeLabLogo.svg" 
      alt="Vibe Lab" 
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
    />
  );
}