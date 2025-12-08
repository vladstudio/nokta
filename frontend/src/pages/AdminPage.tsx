import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { users, stats } from '../services/pocketbase';
import { Button, ScrollArea, Dialog, Input, RadioGroup, useToastManager, Card } from '../ui';
import type { User } from '../types';
import { ArrowLeftIcon, PlusIcon, PencilIcon, ProhibitIcon, CheckCircleIcon } from "@phosphor-icons/react";

export default function AdminPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const toast = useToastManager();
  const [userList, setUserList] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'Member' | 'Admin'>('Member');
  const [confirmBan, setConfirmBan] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [userErrors, setUserErrors] = useState<string[]>([]);
  const [systemStats, setSystemStats] = useState<{ dataSizeMB: number; freeSpaceMB: number } | null>(null);

  const loadUsers = useCallback(() => {
    users.list().then(setUserList).catch(() => {
      toast.add({ title: t('admin.failedToLoadUsers'), data: { type: 'error' } });
      setUserList([]);
    });
  }, [toast, t]);

  useEffect(() => {
    loadUsers();
    stats.get().then(setSystemStats).catch(console.error);
  }, [loadUsers]);

  const handleSaveUser = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;
    setUserErrors([]);
    try {
      if (editingUser) {
        await users.update(editingUser.id, { name: userName, role: userRole });
        toast.add({ title: t('admin.userUpdated'), data: { type: 'success' } });
      } else {
        const created = await users.create(userEmail, userName, userRole, userPassword || undefined);
        if (!userPassword) {
          setGeneratedPassword(created.password);
        }
        toast.add({ title: t('admin.userCreated'), data: { type: 'success' } });
      }
      setShowUserDialog(false);
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('Member');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      const pbError = error as { data?: { data?: Record<string, { message?: string }> }; message?: string };
      setUserErrors(
        pbError?.data?.data
          ? Object.entries(pbError.data.data).map(([key, e]) => `${key}: ${e?.message || t('errors.unknown')}`).filter(Boolean)
          : [pbError?.message || t('admin.failedToSaveUser')]
      );
    }
  }, [userName, userEmail, userPassword, userRole, editingUser, loadUsers, toast, t]);

  const handleToggleBan = useCallback(async (user?: User) => {
    const target = user || confirmBan;
    if (!target) return;
    try {
      await users.setBanned(target.id, !target.banned);
      loadUsers();
      toast.add({ title: t(target.banned ? 'admin.userUnbanned' : 'admin.userBanned'), data: { type: 'success' } });
    } catch {
      toast.add({ title: t('admin.failedToBanUser'), data: { type: 'error' } });
    } finally {
      setConfirmBan(null);
    }
  }, [confirmBan, loadUsers, toast, t]);

  const openUserDialog = useCallback((user?: User) => {
    setEditingUser(user || null);
    setUserName(user?.name || '');
    setUserEmail(user?.email || '');
    setUserPassword('');
    setUserRole(user?.role || 'Member');
    setUserErrors([]);
    setShowUserDialog(true);
  }, []);

  return (
    <ScrollArea>
      <div className="mx-auto w-full max-w-2xl grid gap-4 p-2 sm:p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/chat')}>
            <ArrowLeftIcon size={20} className="text-accent" />
          </Button>
          <h2 className="font-semibold flex-1">{t('admin.title')}</h2>
          <Button variant="ghost" href="https://dashboard.daily.co" target="_blank" className="text-accent">
            Daily.co
          </Button>
          <Button variant="ghost" href={`${import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'}/_/`} target="_blank" className="text-accent">
            Pocketbase
          </Button>
        </div>

        {systemStats && (
          <Card shadow="sm" border padding="sm">
            <div className="text-xs text-light">{t('admin.dataSize')}: {systemStats.dataSizeMB} MB • {t('admin.freeSpace')}: {systemStats.freeSpaceMB} MB</div>
          </Card>
        )}

        <div className="grid gap-2">
          <Button variant="default" onClick={() => openUserDialog()}>
            <PlusIcon size={20} className="text-accent" /> {t('admin.addUser')}
          </Button>
          {userList.map((user) => (
            <Card key={user.id} shadow="sm" border padding="sm" className={user.banned ? 'opacity-60' : ''}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium">{user.name || user.email}{user.banned && <span className="text-red-600 ml-2">({t('admin.banned')})</span>}</div>
                  <div className="text-xs text-light">{user.email} • {user.role}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openUserDialog(user)}>
                  <PencilIcon size={20} className="text-accent" />
                </Button>
                {user.banned ? (
                  <Button variant="ghost" size="icon" onClick={() => handleToggleBan(user)}>
                    <CheckCircleIcon size={20} className="text-green-600" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => setConfirmBan(user)}>
                    <ProhibitIcon size={20} className="text-red-600" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Dialog
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          title={editingUser ? t('admin.editUser') : t('admin.addUser')}
          footer={
            <>
              <Button variant="outline" className="flex-1 center" onClick={() => setShowUserDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" className="flex-1 center" type="submit" form="user-form">
                {t('common.save')}
              </Button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSaveUser} className="grid gap-4">
            <Input placeholder={t('common.name')} value={userName} onChange={(e) => setUserName(e.target.value)} maxLength={24} />
            <Input placeholder={t('common.email')} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} disabled={!!editingUser} />
            {!editingUser && <Input placeholder={t('admin.passwordPlaceholder')} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />}
            <RadioGroup value={userRole} onChange={(value) => setUserRole(value as 'Member' | 'Admin')} options={[{ value: 'Member', label: t('admin.member') }, { value: 'Admin', label: t('admin.admin') }]} />
            {userErrors.length > 0 && (
              <div className="text-sm text-red-600">
                {userErrors.map((err, i) => <div key={i}>{err}</div>)}
              </div>
            )}
          </form>
        </Dialog>

        <Dialog
          open={!!generatedPassword}
          onOpenChange={() => setGeneratedPassword(null)}
          title={t('admin.userCreated')}
          footer={<Button variant="primary" onClick={() => setGeneratedPassword(null)}>{t('common.close')}</Button>}
        >
          <div className="grid gap-4">
            <p className="text-sm">{t('admin.passwordForNewUser')}</p>
            <Input value={generatedPassword || ''} readOnly />
            <p className="text-xs text-light">{t('admin.savePassword')}</p>
          </div>
        </Dialog>

        <Dialog
          open={!!confirmBan}
          onOpenChange={() => setConfirmBan(null)}
          title={t('admin.confirmBan')}
          footer={
            <>
              <Button variant="outline" className="flex-1 center" onClick={() => setConfirmBan(null)}>{t('common.cancel')}</Button>
              <Button variant="primary" className="flex-1 center" onClick={() => handleToggleBan()}>{t('admin.ban')}</Button>
            </>
          }
        >
          <p>{t('admin.confirmBanUser')}</p>
        </Dialog>
      </div>
    </ScrollArea>
  );
}
