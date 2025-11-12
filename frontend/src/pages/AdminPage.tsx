import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { auth, spaces, users, spaceMembers } from '../services/pocketbase';
import { Button, ScrollArea, Dialog, Input, RadioGroup, Select } from '../ui';
import type { Space, User, SpaceMember } from '../types';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, UsersIcon } from "@phosphor-icons/react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
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
  const [userRole, setUserRole] = useState<'Member' | 'Admin'>('Member');
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [memberList, setMemberList] = useState<SpaceMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (auth.user?.role !== 'Admin') {
      setLocation('/my');
    }
  }, [setLocation]);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  const loadUsers = useCallback(() => {
    users.list().then(setUserList).catch(() => setUserList([]));
  }, []);

  const loadMembers = useCallback((spaceId: string) => {
    spaceMembers.list(spaceId).then(setMemberList).catch(() => setMemberList([]));
  }, []);

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
    } catch (error) {
      console.error('Failed to save space:', error);
    }
  }, [spaceName, editingSpace, loadSpaces]);

  const handleDeleteSpace = useCallback(async (space: Space) => {
    if (!confirm(`Delete space "${space.name}"?`)) return;
    try {
      await spaces.delete(space.id);
      loadSpaces();
    } catch (error) {
      console.error('Failed to delete space:', error);
    }
  }, [loadSpaces]);

  const handleSaveUser = useCallback(async () => {
    if (!userName.trim() || !userEmail.trim()) return;
    try {
      if (editingUser) {
        await users.update(editingUser.id, { name: userName, email: userEmail, role: userRole });
      } else {
        await users.create(userEmail, userName, userRole);
      }
      setShowUserDialog(false);
      setUserName('');
      setUserEmail('');
      setUserRole('Member');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }, [userName, userEmail, userRole, editingUser, loadUsers]);

  const handleDeleteUser = useCallback(async (user: User) => {
    if (!confirm(`Delete user "${user.name || user.email}"?`)) return;
    try {
      await users.delete(user.id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }, [loadUsers]);

  const openSpaceDialog = useCallback((space?: Space) => {
    setEditingSpace(space || null);
    setSpaceName(space?.name || '');
    setShowSpaceDialog(true);
  }, []);

  const openUserDialog = useCallback((user?: User) => {
    setEditingUser(user || null);
    setUserName(user?.name || '');
    setUserEmail(user?.email || '');
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
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  }, [selectedSpace, loadMembers]);

  const handleRemoveMember = useCallback(async (member: SpaceMember) => {
    if (!selectedSpace || !confirm(`Remove ${member.expand?.user?.name || 'user'} from space?`)) return;
    try {
      await spaceMembers.remove(member.id);
      loadMembers(selectedSpace.id);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  }, [selectedSpace, loadMembers]);

  return (
    <ScrollArea>
      <div className="mx-auto w-full max-w-2xl grid gap-4 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/my')} className="text-xs">
            <ArrowLeftIcon size={16} />
          </Button>
          <h2 className="font-semibold flex-1">Admin Panel</h2>
        </div>

        <div className="flex gap-2 border-b border-default">
          <Button variant="ghost" onClick={() => setActiveTab('spaces')} className={activeTab === 'spaces' ? 'border-b-2 border-accent' : ''}>
            Spaces
          </Button>
          <Button variant="ghost" onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'border-b-2 border-accent' : ''}>
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
                <Button variant="ghost" onClick={() => handleDeleteSpace(space)} className="text-xs text-red-500">
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
                <Button variant="ghost" onClick={() => handleRemoveMember(member)} className="text-xs text-red-500">
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
                <Button variant="ghost" onClick={() => handleDeleteUser(user)} className="text-xs text-red-500">
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
      </div>
    </ScrollArea>
  );
}
