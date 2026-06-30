import { FaTelegram, FaVk, FaYoutube } from "react-icons/fa";

export const TelegramIcon = ({ className }: { className?: string }) => (
  <FaTelegram {...({ className } as any)} />
);

export const VkIcon = ({ className }: { className?: string }) => (
  <FaVk {...({ className } as any)} />
);

export const YoutubeIcon = ({ className }: { className?: string }) => (
  <FaYoutube {...({ className } as any)} />
);

export const DzenIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C12 5.523 12 12 0 12C12 12 12 18.477 12 24C12 18.477 12 12 24 12C12 12 12 5.523 12 0Z" />
  </svg>
);
