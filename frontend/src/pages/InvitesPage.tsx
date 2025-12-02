import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { invitations } from '../services/pocketbase';
import type { Invitation } from '../types';
import { Button, Card, ScrollArea, useToastManager } from '../ui';
import { ArrowLeftIcon, CopyIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';

export default function InvitesPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const toastManager = useToastManager();
  const [list, setList] = useState<Invitation[]>([]);
  const [creating, setCreating] = useState(false);
  const [newestId, setNewestId] = useState<string | null>(null);

  useEffect(() => { invitations.list().then(setList).catch(() => { }); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const inv = await invitations.create();
      setNewestId(inv.id);
      setList([inv, ...list]);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/signup/${code}`);
    toastManager.add({ title: t('common.copied'), data: { type: 'success' } });
  };

  const handleDelete = async (id: string) => {
    try {
      await invitations.delete(id);
      setList(list.filter(i => i.id !== id));
    } catch { /* ignore */ }
  };

  const formatExpiry = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-2 pl-4 border-b bg-(--color-bg-primary) border-(--color-border-default)">
        <div className="flex items-center gap-2">
          <button onClick={() => setLocation('/settings')} className="p-1 -ml-2">
            <ArrowLeftIcon size={20} className="text-accent" />
          </button>
          <h2 className="font-semibold">{t('invites.title')}</h2>
        </div>
        <Button variant="ghost" onClick={handleCreate} disabled={creating} className="text-accent">
          <PlusIcon size={20} /> {t('invites.create')}
        </Button>
      </header>
      <ScrollArea>
        <div className="mx-auto w-full max-w-md p-4 grid gap-4">
          <p className="text-sm text-light text-center">{t('invites.description')}</p>
          {list.map(inv => (
            <Card key={inv.id} border padding="sm" className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <code className="text-sm truncate block">{inv.code.slice(0, 8)}...</code>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => handleCopy(inv.code)} className="text-accent">
                    <CopyIcon size={16} /> {t('invites.copyLink')}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)}>
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </div>
              {newestId === inv.id && (
                <p className="text-xs text-light">{t('invites.copyHint')} {t('invites.expires')}: {formatExpiry(inv.expires_at)}</p>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
