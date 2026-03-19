import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

const LanguageSelector = ({ variant = "default", showLabel = true }) => {
  const { language, setLanguage, supportedLanguages, isRTL } = useLanguage();
  
  const currentLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
          data-testid="language-selector"
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <>
              <span className="text-sm">{currentLang.flag}</span>
              <span className="hidden sm:inline text-xs">{currentLang.code.toUpperCase()}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 max-h-80 overflow-y-auto bg-[#111827] border-slate-700">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-emerald-900/30 text-emerald-400' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            data-testid={`lang-${lang.code}`}
          >
            <span className="text-sm mr-2">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-emerald-400">&#10003;</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
