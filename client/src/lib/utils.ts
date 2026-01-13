import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string | undefined, width = 800) {
  if (!url) return "";

  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Insert transformations before /v[version]/ or after /upload/
    // Pattern: .../upload/... -> .../upload/f_auto,q_auto,w_{width}/...
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }

  return url;
}
