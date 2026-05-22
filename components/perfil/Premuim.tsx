import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export const BadgePremium = () => (
  <span className="text-[var(--cor-destaque)] ml-2 animate-pulse" title="Usuário Premium">
    <CheckBadgeIcon className="w-5 h-5 inline-block align-middle" />
  </span>
);