
import { Globe, ExternalLink } from "lucide-react";

interface ProjectCardDomainProps {
  domain?: string;
}

export const ProjectCardDomain = ({ domain }: ProjectCardDomainProps) => {
  if (!domain) return null;
  
  return (
    <div className="flex items-center text-xs text-gray-600 mt-1">
      <Globe className="h-3 w-3 mr-1 text-blue-500" />
      <span className="truncate">{domain}</span>
      <a 
        href={`https://${domain}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-1 inline-flex"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-3 w-3 text-gray-400 hover:text-primary" />
      </a>
    </div>
  );
};
