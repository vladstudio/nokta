import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { spaces, users, spaceMembers } from '../services/pocketbase';
import { Button, ScrollArea, Dialog, Input, RadioGroup, Select, useToastManager, Card, Checkbox } from '../ui';
import type { Space, User, SpaceMember } from '../types';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, UsersIcon } from "@phosphor-icons/react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const toast = useToastManager();
  const [activeTab, setActiveTab] = useState<'spaces' | 'users'>('spaces');
  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showSpaceDialog, setShowSpaceDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'Member' | 'Admin'>('Member');
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [memberList, setMemberList] = useState<SpaceMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'space' | 'user' | 'member'; item: any } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [userErrors, setUserErrors] = useState<string[]>([]);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => {
      toast.add({ title: 'Failed to load spaces', data: { type: 'error' } });
      setSpaceList([]);
    });
  }, [toast]);

  const loadUsers = useCallback(() => {
    users.list().then(setUserList).catch(() => {
      toast.add({ title: 'Failed to load users', data: { type: 'error' } });
      setUserList([]);
    });
  }, [toast]);

  const loadMembers = useCallback((spaceId: string) => {
    spaceMembers.list(spaceId).then(setMemberList).catch(() => {
      toast.add({ title: 'Failed to load members', data: { type: 'error' } });
      setMemberList([]);
    });
  }, [toast]);

  useEffect(() => {
    loadSpaces();
    loadUsers();
  }, [loadSpaces, loadUsers]);

  const handleSaveSpace = useCallback(async () => {
    if (!spaceName.trim()) return;
    try {
      if (editingSpace) {
        await spaces.update(editingSpace.id, spaceName);
      } else {
        await spaces.create(spaceName);
      }
      setShowSpaceDialog(false);
      setSpaceName('');
      setEditingSpace(null);
      loadSpaces();
      toast.add({ title: editingSpace ? 'Space updated' : 'Space created', data: { type: 'success' } });
    } catch (error) {
      toast.add({ title: 'Failed to save space', data: { type: 'error' } });
    }
  }, [spaceName, editingSpace, loadSpaces, toast]);

  const handleDeleteSpace = useCallback(async () => {
    if (!confirmDelete || confirmDelete.type !== 'space') return;
    try {
      await spaces.delete(confirmDelete.item.id);
      loadSpaces();
      toast.add({ title: 'Space deleted', data: { type: 'success' } });
    } catch (error) {
      toast.add({ title: 'Failed to delete space', data: { type: 'error' } });
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, loadSpaces, toast]);

  const handleSaveUser = useCallback(async () => {
    if (!userName.trim() || !userEmail.trim()) return;
    setUserErrors([]);
    try {
      if (editingUser) {
        await users.update(editingUser.id, { name: userName, email: userEmail, role: userRole });
        toast.add({ title: 'User updated', data: { type: 'success' } });
      } else {
        const created = await users.create(userEmail, userName, userRole, userPassword || undefined);
        const userId = created.user?.id || created.id;
        await Promise.all(selectedSpaceIds.map(spaceId => spaceMembers.add(spaceId, userId)));
        setGeneratedPassword(created.password);
        toast.add({ title: 'User created', data: { type: 'success' } });
      }
      setShowUserDialog(false);
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('Member');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      setUserErrors(error?.data?.data ? Object.entries(error.data.data).map(([key, e]: [string, any]) => `${key}: ${e?.message}`).filter(Boolean) : [error?.message || 'Failed to save user']);
    }
  }, [userName, userEmail, userPassword, userRole, editingUser, selectedSpaceIds, loadUsers, toast]);

  const handleDeleteUser = useCallback(async () => {
    if (!confirmDelete || confirmDelete.type !== 'user') return;
    try {
      await users.delete(confirmDelete.item.id);
      loadUsers();
      toast.add({ title: 'User deleted', data: { type: 'success' } });
    } catch (error) {
      toast.add({ title: 'Failed to delete user', data: { type: 'error' } });
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, loadUsers, toast]);

  const openSpaceDialog = useCallback((space?: Space) => {
    setEditingSpace(space || null);
    setSpaceName(space?.name || '');
    setShowSpaceDialog(true);
  }, []);

  const openUserDialog = useCallback((user?: User) => {
    setEditingUser(user || null);
    setUserName(user?.name || '');
    setUserEmail(user?.email || '');
    setUserPassword('');
    setUserRole(user?.role || 'Member');
    setUserErrors([]);
    setSelectedSpaceIds([]);
    setShowUserDialog(true);
  }, []);

  const openMemberManagement = useCallback((space: Space) => {
    setSelectedSpace(space);
    loadMembers(space.id);
  }, [loadMembers]);

  const handleAddMember = useCallback(async (userId: string) => {
    if (!selectedSpace || !userId) return;
    try {
      await spaceMembers.add(selectedSpace.id, userId);
      setSelectedUserId('');
      loadMembers(selectedSpace.id);
      toast.add({ title: 'Member added', data: { type: 'success' } });
    } catch (error) {
      toast.add({ title: 'Failed to add member', data: { type: 'error' } });
    }
  }, [selectedSpace, loadMembers, toast]);

  const handleRemoveMember = useCallback(async () => {
    if (!confirmDelete || confirmDelete.type !== 'member') return;
    try {
      await spaceMembers.remove(confirmDelete.item.id);
      if (selectedSpace) loadMembers(selectedSpace.id);
      toast.add({ title: 'Member removed', data: { type: 'success' } });
    } catch (error) {
      toast.add({ title: 'Failed to remove member', data: { type: 'error' } });
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, selectedSpace, loadMembers, toast]);

  return (
    <ScrollArea>
      <div className="mx-auto w-full max-w-2xl grid gap-4 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/my')}>
            <ArrowLeftIcon size={20} />
          </Button>
          <h2 className="font-semibold flex-1">Admin Panel</h2>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('spaces')}
            isSelected={activeTab === 'spaces'}
          >
            Spaces
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('users')}
            isSelected={activeTab === 'users'}
          >
            Users
          </Button>
        </div>

        {activeTab === 'spaces' && !selectedSpace && (
          <div className="grid gap-2">
            <Button variant="default" onClick={() => openSpaceDialog()}>
              <PlusIcon size={20} /> Add Space
            </Button>
            {spaceList.map((space) => (
              <Card key={space.id} border shadow="sm" padding="sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-medium">{space.name}</div>
                  <Button variant="ghost" size="icon" onClick={() => openMemberManagement(space)}>
                    <UsersIcon size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openSpaceDialog(space)}>
                    <PencilIcon size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDelete({ type: 'space', item: space })}>
                    <TrashIcon size={20} className="text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'spaces' && selectedSpace && (
          <div className="grid gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSpace(null)}>
              <ArrowLeftIcon size={20} />
            </Button>
            <h3 className="font-semibold">{selectedSpace.name} - Members</h3>
            {userList.filter(u => !memberList.some(m => m.user === u.id)).length > 0 && (
              <Select
                value={selectedUserId}
                onChange={(value) => {
                  if (value) {
                    handleAddMember(value);
                  }
                }}
                options={userList.filter(u => !memberList.some(m => m.user === u.id)).map(u => ({ value: u.id, label: u.name || u.email }))}
                placeholder="Add member..."
              />
            )}
            {memberList.map((member) => (
              <Card key={member.id} shadow="sm" border padding="sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{member.expand?.user?.name || member.expand?.user?.email}</div>
                    <div className="text-xs text-light">{member.expand?.user?.email}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDelete({ type: 'member', item: member })}>
                    <TrashIcon size={20} className="text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid gap-2">
            <Button variant="default" onClick={() => openUserDialog()}>
              <PlusIcon size={20} /> Add User
            </Button>
            {userList.map((user) => (
              <Card key={user.id} shadow="sm" border padding="sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-xs text-light">{user.email} • {user.role}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openUserDialog(user)}>
                    <PencilIcon size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDelete({ type: 'user', item: user })}>
                    <TrashIcon size={20} className="text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={showSpaceDialog}
          onOpenChange={setShowSpaceDialog}
          title={editingSpace ? 'Edit Space' : 'Add Space'}
          footer={
            <>
              <Button variant="default" onClick={() => setShowSpaceDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveSpace}>
                Save
              </Button>
            </>
          }
        >
          <Input placeholder="Space name" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} />
        </Dialog>

        <Dialog
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          title={editingUser ? 'Edit User' : 'Add User'}
          footer={
            <>
              <Button variant="default" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                Save
              </Button>
            </>
          }
        >
          <div className="grid gap-4">
            <Input placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <Input placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} disabled={!!editingUser} />
            {!editingUser && <Input placeholder="Password (auto-generated if empty)" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />}
            <RadioGroup value={userRole} onChange={(value) => setUserRole(value as 'Member' | 'Admin')} options={[{ value: 'Member', label: 'Member' }, { value: 'Admin', label: 'Admin' }]} />
            {!editingUser && spaceList.length > 0 && (
              <div className="grid gap-2">
                <div className="text-sm font-medium">Spaces</div>
                {spaceList.map(space => (
                  <label key={space.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedSpaceIds.includes(space.id)}
                      onCheckedChange={(checked) => setSelectedSpaceIds(prev => checked ? [...prev, space.id] : prev.filter(id => id !== space.id))}
                    />
                    <span className="text-sm">{space.name}</span>
                  </label>
                ))}
              </div>
            )}
            {userErrors.length > 0 && (
              <div className="text-sm text-red-600">
                {userErrors.map((err, i) => <div key={i}>{err}</div>)}
              </div>
            )}
          </div>
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
              <Button variant="default" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmDelete?.type === 'space' ? handleDeleteSpace : confirmDelete?.type === 'user' ? handleDeleteUser : handleRemoveMember}>
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this {confirmDelete?.type}?</p>
        </Dialog>
      </div>
    </ScrollArea>
  );
}
