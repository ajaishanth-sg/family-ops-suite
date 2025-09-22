import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  updated_by: string;
  updated_at: string;
  updater?: {
    first_name: string;
    last_name: string;
  };
}

interface SettingsProps {
  userRole: string;
}

export function Settings({ userRole }: SettingsProps) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [showNewSetting, setShowNewSetting] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const { toast } = useToast();

  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    description: "",
    category: "general",
    is_public: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      setSettings(data as SystemSetting[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSetting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let parsedValue;
      try {
        parsedValue = JSON.parse(newSetting.value);
      } catch {
        parsedValue = newSetting.value;
      }

      const { error } = await supabase
        .from('system_settings')
        .insert([{
          key: newSetting.key,
          value: parsedValue,
          description: newSetting.description || null,
          category: newSetting.category,
          is_public: newSetting.is_public,
          updated_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Setting created successfully"
      });

      setShowNewSetting(false);
      setNewSetting({
        key: "",
        value: "",
        description: "",
        category: "general",
        is_public: false
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSetting = async (setting: SystemSetting) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('system_settings')
        .update({
          value: setting.value,
          description: setting.description,
          is_public: setting.is_public,
          updated_by: user.id
        })
        .eq('id', setting.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Setting updated successfully"
      });

      setEditingSetting(null);
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Setting deleted successfully"
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const categories = [...new Set(settings.map(s => s.category))];
  const filteredSettings = settings.filter(s => s.category === selectedCategory);

  const renderValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const canManageSettings = ["chairman", "head-of-operations"].includes(userRole);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure system parameters and preferences
          </p>
        </div>
        {canManageSettings && (
          <Dialog open={showNewSetting} onOpenChange={setShowNewSetting}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Setting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Setting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key">Setting Key</Label>
                  <Input
                    id="key"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                    placeholder="app.theme.default"
                  />
                </div>
                <div>
                  <Label htmlFor="value">Value (JSON format)</Label>
                  <Textarea
                    id="value"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                    placeholder='"light"'
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                    placeholder="Default theme for the application"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newSetting.category}
                    onChange={(e) => setNewSetting({...newSetting, category: e.target.value})}
                    placeholder="general"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={newSetting.is_public}
                    onCheckedChange={(checked) => setNewSetting({...newSetting, is_public: checked})}
                  />
                  <Label htmlFor="is_public">Public Setting (visible to all users)</Label>
                </div>
                <Button onClick={createSetting} className="w-full">
                  Create Setting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Public Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.filter(s => s.is_public).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Private Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.filter(s => !s.is_public).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {filteredSettings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        {setting.key}
                      </CardTitle>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {setting.is_public ? (
                        <Badge variant="default">Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                      {canManageSettings && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSetting(setting)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSetting(setting.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Value:</Label>
                      <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                        {renderValue(setting.value)}
                      </pre>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last updated by {setting.updated_by} on{' '}
                      {new Date(setting.updated_at).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSettings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No settings found in this category</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Setting Dialog */}
      {editingSetting && (
        <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Setting: {editingSetting.key}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_value">Value (JSON format)</Label>
                <Textarea
                  id="edit_value"
                  value={renderValue(editingSetting.value)}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting,
                    value: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={editingSetting.description || ""}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting,
                    description: e.target.value
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_public"
                  checked={editingSetting.is_public}
                  onCheckedChange={(checked) => setEditingSetting({
                    ...editingSetting,
                    is_public: checked
                  })}
                />
                <Label htmlFor="edit_is_public">Public Setting</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateSetting(editingSetting)} className="flex-1">
                  Update Setting
                </Button>
                <Button variant="outline" onClick={() => setEditingSetting(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}