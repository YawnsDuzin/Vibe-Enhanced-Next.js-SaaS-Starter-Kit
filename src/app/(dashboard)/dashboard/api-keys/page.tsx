'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { Plus, Copy, Trash2, Key, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKey, setShowKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch {
      toast.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        toast.error('Failed to create API key');
        return;
      }

      const data = await response.json();
      setNewKeyValue(data.key);
      setApiKeys([data, ...apiKeys]);
      toast.success('API key created successfully');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete API key');
        return;
      }

      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success('API key deleted');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API keys for programmatic access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access to your account.
              </DialogDescription>
            </DialogHeader>
            {newKeyValue ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-2">Your new API key:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-background p-2 rounded break-all">
                      {newKeyValue}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(newKeyValue)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-destructive">
                  Make sure to copy this key now. You won&apos;t be able to see
                  it again!
                </p>
                <Button className="w-full" onClick={closeDialog}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="E.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={createApiKey} loading={creating}>
                    Create Key
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </Card>
      ) : apiKeys.length === 0 ? (
        <Card className="p-12 text-center">
          <Key className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No API keys yet</h3>
          <p className="text-muted-foreground mt-2">
            Create your first API key to start using the API.
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Use these keys to authenticate API requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{apiKey.name}</p>
                      {apiKey.expiresAt &&
                        new Date(apiKey.expiresAt) < new Date() && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-muted px-2 py-0.5 rounded">
                        {showKey === apiKey.id
                          ? apiKey.key
                          : maskKey(apiKey.key)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          setShowKey(showKey === apiKey.id ? null : apiKey.id)
                        }
                      >
                        {showKey === apiKey.id ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(apiKey.createdAt)}
                      {apiKey.lastUsedAt &&
                        ` • Last used ${formatDate(apiKey.lastUsedAt)}`}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteApiKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
