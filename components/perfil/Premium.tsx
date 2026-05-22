import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export const BadgePremium = () => (
  <div 
    className="text-yellow-500 ml-2 flex items-center justify-center animate-pulse drop-shadow-md" 
    title="Leitor Premium Letrify"
  >
    <CheckBadgeIcon className="w-8 h-8" />
  </div>
);