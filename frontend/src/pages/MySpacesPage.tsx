import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { auth, spaces } from '../services/pocketbase';
import { LAST_SPACE_KEY } from '../components/Sidebar';
import { Button, ScrollArea } from '../ui';
import type { Space } from '../types';
import { ArrowRightIcon, ShieldCheckIcon } from "@phosphor-icons/react";

export default function MySpacesPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [spaceList, setSpaceList] = useState<Space[]>([]);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  const handleSpaceClick = useCallback((space: Space) => {
    localStorage.setItem(LAST_SPACE_KEY, space.id);
    setLocation(`/spaces/${space.id}/chat`);
  }, [setLocation]);

  const handleLogout = useCallback(() => {
    auth.logout();
    setLocation('/login');
  }, [setLocation]);

  return (
    <ScrollArea>
      <div className="mx-auto w-full max-w-md grid gap-4 p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold flex-1">{t('mySpacesPage.title')}</h2>
          {auth.user?.role === 'Admin' && (
            <Button variant="ghost" onClick={() => setLocation('/admin')} className="text-xs text-light">
              <ShieldCheckIcon size={16} className="mr-1" /> Admin
            </Button>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-xs text-light">
            {t('sidebar.logOut')}
          </Button>
        </div>
        {spaceList.length > 0 ? (
          <div className="space-y-1">
            {spaceList.map((space) => (
              <Button
                variant="default"
                key={space.id}
                onClick={() => handleSpaceClick(space)}
                className="w-full p-3! text-left font-normal! flex items-center gap-2"
              >
                <div className="flex-1">{space.name}</div>
                <ArrowRightIcon size={20} className="text-accent" />
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-light font-medium text-center p-4 sm:p-8">{t('mySpacesPage.noSpaces')}</p>
        )}
      </div>
    </ScrollArea>
  );
}
