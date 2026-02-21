import React from "react";
import { Sparkles, Cpu, Zap } from "lucide-react";

interface ProviderBadgeProps {
  providerId: string;
}

export default function ProviderBadge({ providerId }: ProviderBadgeProps) {
  switch (providerId) {
    case "openai":
      return <Sparkles size={13} className="text-green-500 flex-shrink-0" />;
    case "anthropic":
      return <Cpu size={13} className="text-orange-500 flex-shrink-0" />;
    case "google":
      return <Zap size={13} className="text-blue-500 flex-shrink-0" />;
    default:
      return null;
  }
}
