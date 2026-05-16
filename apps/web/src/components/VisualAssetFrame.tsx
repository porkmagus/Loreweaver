import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { visualStatusLabel, type VisualAsset } from '@/lib/visualAssets';

export function WorldBannerFrame({
  asset,
  title,
  subtitle,
  className,
}: {
  asset: VisualAsset | null;
  title: string;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-card border border-ridge bg-depth", className)}>
      {asset?.imageUrl ? (
        <img src={asset.imageUrl} alt={`${title} world banner`} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <AtmosphericFallback title={title} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/55 to-void/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void/95 to-transparent" />
      <div className="relative flex h-full min-h-[220px] flex-col justify-end p-inner">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-tiny uppercase tracking-widest text-dust">{visualStatusLabel(asset)}</span>
          </div>
          <h2 className="font-serif text-display text-parchment">{title}</h2>
          {subtitle && <p className="max-w-xl text-body leading-relaxed text-ash">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function PortraitFrame({
  asset,
  name,
  role,
  className,
}: {
  asset: VisualAsset | null;
  name: string;
  role?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-card border border-ridge bg-depth", className)}>
      {asset?.imageUrl ? (
        <img src={asset.imageUrl} alt={`${name} portrait`} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <AtmosphericFallback title={name} portrait />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="truncate font-serif text-h3 text-parchment">{name}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          {role && <p className="truncate text-tiny uppercase tracking-widest text-ash">{role}</p>}
          {asset?.status !== 'generated' && (
            <ImageOff className="h-3.5 w-3.5 shrink-0 text-dust" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}

function AtmosphericFallback({ title, portrait }: { title: string; portrait?: boolean }) {
  const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const accents = ['bg-gold/20', 'bg-sage/20', 'bg-ember/20', 'bg-memory/20', 'bg-mist/20'];
  const accent = accents[hash % accents.length];
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'LW';

  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_30%,rgba(201,169,110,0.22),transparent_36%),linear-gradient(135deg,#111318,#0A0B0F_60%,#181A21)]">
      <div className={cn("absolute rounded-full blur-2xl", accent, portrait ? "left-1/2 top-1/4 h-44 w-44 -translate-x-1/2" : "right-16 top-10 h-56 w-56")} />
      {portrait ? (
        <div className="absolute inset-x-0 top-12 flex justify-center">
          <div className="relative h-48 w-36">
            <div className="absolute left-1/2 top-2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full border border-gold/30 bg-surface/80 shadow-depth">
              <span className="font-serif text-h1 text-parchment/85">{initials}</span>
            </div>
            <div className="absolute bottom-0 left-1/2 h-32 w-36 -translate-x-1/2 rounded-t-full border border-ridge bg-depth/90" />
            <div className="absolute bottom-7 left-1/2 h-px w-24 -translate-x-1/2 bg-gold/35" />
          </div>
        </div>
      ) : (
        <>
          <div className="absolute bottom-16 left-12 h-28 w-80 rounded-t-full border-t border-gold/20 bg-depth/40" />
          <div className="absolute bottom-24 right-20 h-40 w-32 border-l border-gold/20 bg-depth/30" />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(160deg,transparent,#0A0B0F_70%)]" />
      <div className="absolute bottom-8 left-8 h-px w-28 bg-gold/40" />
    </div>
  );
}
