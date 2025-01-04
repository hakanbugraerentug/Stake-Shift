import { Tooltip } from "./ui/tooltip"

interface PubkeyDisplayProps {
  pubkey: string;
  short?: boolean;
}

export function PubkeyDisplay({ pubkey, short = true }: PubkeyDisplayProps) {
  return (
    <Tooltip content={pubkey}>
      <span className="cursor-help">
        {short ? `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}` : pubkey}
      </span>
    </Tooltip>
  );
} 