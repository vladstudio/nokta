import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { users } from '../services/pocketbase';
import { Button, ScrollArea, Dialog, Input, RadioGroup, useToastManager, Card } from '../ui';
import type { User } from '../types';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const toast = useToastManager();
  const [userList, setUserList] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'Member' | 'Admin'>('Member');
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [userErrors, setUserErrors] = useState<string[]>([]);

  const loadUsers = useCallback(() => {
    users.list().then(setUserList).catch(() => {
      toast.add({ title: 'Failed to load users', data: { type: 'error' } });
      setUserList([]);
    });
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSaveUser = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;
    setUserErrors([]);
    try {
      if (editingUser) {
        await users.update(editingUser.id, { name: userName, role: userRole });
        toast.add({ title: 'User updated', data: { type: 'success' } });
      } else {
        const created = await users.create(userEmail, userName, userRole, userPassword || undefined);
        if (!userPassword) {
          setGeneratedPassword(created.password);
        }
        toast.add({ title: 'User created', data: { type: 'success' } });
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
          ? Object.entries(pbError.data.data).map(([key, e]) => `${key}: ${e?.message || 'Unknown error'}`).filter(Boolean)
          : [pbError?.message || 'Failed to save user']
      );
    }
  }, [userName, userEmail, userPassword, userRole, editingUser, loadUsers, toast]);

  const handleDeleteUser = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await users.delete(confirmDelete.id);
      loadUsers();
      toast.add({ title: 'User deleted', data: { type: 'success' } });
    } catch (error) {
      toast.add({ title: 'Failed to delete user', data: { type: 'error' } });
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, loadUsers, toast]);

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
      <div className="mx-auto w-full max-w-2xl grid gap-4 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/chat')}>
            <ArrowLeftIcon size={20} className="text-accent" />
          </Button>
          <h2 className="font-semibold flex-1">Admin Panel - Users</h2>
        </div>

        <div className="grid gap-2">
          <Button variant="default" onClick={() => openUserDialog()}>
            <PlusIcon size={20} className="text-accent" /> Add User
          </Button>
          {userList.map((user) => (
            <Card key={user.id} shadow="sm" border padding="sm">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-xs text-light">{user.email} • {user.role}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openUserDialog(user)}>
                  <PencilIcon size={20} className="text-accent" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(user)}>
                  <TrashIcon size={20} className="text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Dialog
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          title={editingUser ? 'Edit User' : 'Add User'}
          footer={
            <>
              <Button variant="outline" className="flex-1 center" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 center" type="submit" form="user-form">
                Save
              </Button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSaveUser} className="grid gap-4">
            <Input placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <Input placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} disabled={!!editingUser} />
            {!editingUser && <Input placeholder="Password (auto-generated if empty)" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />}
            <RadioGroup value={userRole} onChange={(value) => setUserRole(value as 'Member' | 'Admin')} options={[{ value: 'Member', label: 'Member' }, { value: 'Admin', label: 'Admin' }]} />
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
          title="User Created"
          footer={
            <Button variant="primary" onClick={() => setGeneratedPassword(null)}>
              Close
            </Button>
          }
        >
          <div className="grid gap-4">
            <p className="text-sm">Password for new user:</p>
            <Input value={generatedPassword || ''} readOnly />
            <p className="text-xs text-light">Save this password - it won't be shown again.</p>
          </div>
        </Dialog>

        <Dialog
          open={!!confirmDelete}
          onOpenChange={() => setConfirmDelete(null)}
          title="Confirm Delete"
          footer={
            <>
              <Button variant="outline" className="flex-1 center" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 center" onClick={handleDeleteUser}>
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this user?</p>
        </Dialog>
      </div>
    </ScrollArea>
  );
}
