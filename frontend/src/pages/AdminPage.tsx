import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { spaces, users, spaceMembers } from '../services/pocketbase';
import { Button, ScrollArea, Dialog, Input, RadioGroup, Select, useToastManager, Card } from '../ui';
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
    try {
      if (editingUser) {
        await users.update(editingUser.id, { name: userName, email: userEmail, role: userRole });
        toast.add({ title: 'User updated', data: { type: 'success' } });
      } else {
        const { password } = await users.create(userEmail, userName, userRole, userPassword || undefined);
        setGeneratedPassword(password);
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
      toast.add({ title: 'Failed to save user', description: error?.data?.password?.message || error?.message, data: { type: 'error' } });
    }
  }, [userName, userEmail, userPassword, userRole, editingUser, loadUsers, toast]);

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
            <Button variant="default" onClick={() => openSpaceDialog()} className="w-full flex items-center gap-2 justify-center">
              <PlusIcon size={16} /> Add Space
            </Button>
            {spaceList.map((space) => (
              <div key={space.id} className="flex items-center gap-2 p-3 border border-default rounded">
                <div className="flex-1 font-medium">{space.name}</div>
                <Button variant="ghost" onClick={() => openMemberManagement(space)} className="text-xs">
                  <UsersIcon size={16} />
                </Button>
                <Button variant="ghost" onClick={() => openSpaceDialog(space)} className="text-xs">
                  <PencilIcon size={16} />
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete({ type: 'space', item: space })} className="text-xs text-red-500">
                  <TrashIcon size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'spaces' && selectedSpace && (
          <div className="grid gap-2">
            <Button variant="ghost" onClick={() => setSelectedSpace(null)} className="w-fit text-xs">
              <ArrowLeftIcon size={16} />
            </Button>
            <h3 className="font-semibold">{selectedSpace.name} - Members</h3>
            <Select
              value={selectedUserId}
              onChange={(value) => {
                if (value) {
                  handleAddMember(value);
                }
              }}
              options={userList.filter(u => !memberList.some(m => m.user === u.id)).map(u => ({value: u.id, label: u.name || u.email}))}
              placeholder="Add member..."
            />
            {memberList.map((member) => (
              <div key={member.id} className="flex items-center gap-2 p-3 border border-default rounded">
                <div className="flex-1">
                  <div className="font-medium">{member.expand?.user?.name || member.expand?.user?.email}</div>
                  <div className="text-xs text-light">{member.expand?.user?.email}</div>
                </div>
                <Button variant="ghost" onClick={() => setConfirmDelete({ type: 'member', item: member })} className="text-xs text-red-500">
                  <TrashIcon size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid gap-2">
            <Button variant="default" onClick={() => openUserDialog()} className="w-full flex items-center gap-2 justify-center">
              <PlusIcon size={16} /> Add User
            </Button>
            {userList.map((user) => (
              <div key={user.id} className="flex items-center gap-2 p-3 border border-default rounded">
                <div className="flex-1">
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-xs text-light">{user.email} • {user.role}</div>
                </div>
                <Button variant="ghost" onClick={() => openUserDialog(user)} className="text-xs">
                  <PencilIcon size={16} />
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete({ type: 'user', item: user })} className="text-xs text-red-500">
                  <TrashIcon size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showSpaceDialog} onOpenChange={setShowSpaceDialog} title={editingSpace ? 'Edit Space' : 'Add Space'}>
          <Input placeholder="Space name" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowSpaceDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="default" onClick={handleSaveSpace} className="flex-1">
              Save
            </Button>
          </div>
        </Dialog>

        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog} title={editingUser ? 'Edit User' : 'Add User'}>
          <div className="grid gap-4">
            <Input placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <Input placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} disabled={!!editingUser} />
            {!editingUser && <Input placeholder="Password (auto-generated if empty)" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />}
            <RadioGroup value={userRole} onChange={(value) => setUserRole(value as 'Member' | 'Admin')} options={[{ value: 'Member', label: 'Member' }, { value: 'Admin', label: 'Admin' }]} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowUserDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="default" onClick={handleSaveUser} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </Dialog>

        <Dialog open={!!generatedPassword} onOpenChange={() => setGeneratedPassword(null)} title="User Created">
          <div className="grid gap-4">
            <p className="text-sm">Password for new user:</p>
            <Input value={generatedPassword || ''} readOnly />
            <p className="text-xs text-light">Save this password - it won't be shown again.</p>
            <Button variant="default" onClick={() => setGeneratedPassword(null)}>Close</Button>
          </div>
        </Dialog>

        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)} title="Confirm Delete">
          <div className="grid gap-4">
            <p>Are you sure you want to delete this {confirmDelete?.type}?</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
              <Button variant="default" onClick={confirmDelete?.type === 'space' ? handleDeleteSpace : confirmDelete?.type === 'user' ? handleDeleteUser : handleRemoveMember} className="flex-1">Delete</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScrollArea>
  );
}
