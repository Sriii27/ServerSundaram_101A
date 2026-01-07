import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function SilentArchitectBadge({ className }) {
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20",
            className
        )}>
            <Star className="w-3 h-3 fill-amber-500" />
            Silent Architect
        </span>
    );
}
