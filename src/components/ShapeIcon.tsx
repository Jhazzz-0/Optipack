import type { ShapeId } from "@/lib/shapes";

interface Props { id: ShapeId; className?: string }

export function ShapeIcon({ id, className }: Props) {
  const stroke = "currentColor";
  const sw = 1.5;
  switch (id) {
    case "cyl-lid":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" stroke={stroke} strokeWidth={sw}>
          <ellipse cx="32" cy="16" rx="20" ry="6" />
          <path d="M12 16v32" /><path d="M52 16v32" />
          <ellipse cx="32" cy="48" rx="20" ry="6" />
        </svg>
      );
    case "cyl-nolid":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" stroke={stroke} strokeWidth={sw}>
          <ellipse cx="32" cy="16" rx="20" ry="6" strokeDasharray="3 3" />
          <path d="M12 16v32" /><path d="M52 16v32" />
          <ellipse cx="32" cy="48" rx="20" ry="6" />
        </svg>
      );
    case "box-lid":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" stroke={stroke} strokeWidth={sw}>
          <path d="M10 22 L32 12 L54 22 L32 32 Z" />
          <path d="M10 22 V48 L32 58 V32" />
          <path d="M54 22 V48 L32 58" />
        </svg>
      );
    case "box-nolid":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" stroke={stroke} strokeWidth={sw}>
          <path d="M10 22 L32 12 L54 22 L32 32 Z" strokeDasharray="3 3" />
          <path d="M10 22 V48 L32 58 V32" />
          <path d="M54 22 V48 L32 58" />
        </svg>
      );
    case "cone":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" stroke={stroke} strokeWidth={sw}>
          <path d="M32 8 L12 50" />
          <path d="M32 8 L52 50" />
          <ellipse cx="32" cy="50" rx="20" ry="6" />
        </svg>
      );
    case "pyramid":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" stroke={stroke} strokeWidth={sw}>
          <path d="M32 8 L10 48 L54 48 Z" />
          <path d="M32 8 L32 58" strokeDasharray="2 3" />
          <path d="M10 48 L54 48" />
          <path d="M10 48 L32 58 L54 48" />
        </svg>
      );
  }
}
