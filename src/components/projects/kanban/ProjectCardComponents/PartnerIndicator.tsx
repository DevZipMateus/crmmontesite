
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { getPartnerName } from "@/server/webhook-service";

interface PartnerIndicatorProps {
  partnerHash: string;
}

export function PartnerIndicator({ partnerHash }: PartnerIndicatorProps) {
  const [partnerName, setPartnerName] = useState<string | null>(null);

  useEffect(() => {
    if (partnerHash) {
      getPartnerName(partnerHash).then(setPartnerName);
    }
  }, [partnerHash]);

  return (
    <div className="flex items-center gap-2 mb-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Parceiro: {partnerName || partnerHash}
      </Badge>
    </div>
  );
}
