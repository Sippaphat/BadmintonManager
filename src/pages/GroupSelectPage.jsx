import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

const GroupSelectPage = ({ 
  groups, 
  onSelectGroup, 
  onCreateGroup,
  onLogout,
  user,
  loading,
  t 
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    
    setCreating(true);
    try {
      await onCreateGroup(newGroupName);
      setNewGroupName('');
    } finally {
      setCreating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('selectGroup')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name || 'User'}!
            </p>
          </div>
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
        
        {/* Create New Group */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('createGroup')}
          </h3>
          <div className="flex gap-2">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name..."
              fullWidth
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button 
              onClick={handleCreate} 
              disabled={!newGroupName.trim() || creating}
            >
              ➕ {t('create')}
            </Button>
          </div>
        </Card>
        
        {/* Groups List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Groups
          </h3>
          
          {groups.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-30">🏸</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No groups yet. Create one to get started!
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  hover
                  onClick={() => onSelectGroup(group)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {group.name}
                    </h4>
                    {group.isOwner && (
                      <Badge variant="primary" size="sm">Owner</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span className="font-semibold">
                        {group.playerCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-semibold">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Click to open →
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSelectPage;
