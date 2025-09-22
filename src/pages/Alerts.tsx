import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, AlertTriangle, Info, CheckCircle, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_id?: string;
  is_read: boolean;
  is_global: boolean;
  expires_at?: string;
  created_by: string;
  created_at: string;
  creator?: {
    first_name: string;
    last_name: string;
  };
  recipient?: {
    first_name: string;
    last_name: string;
  };
}

interface AlertsProps {
  userRole: string;
}

export function Alerts({ userRole }: AlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    user_id: "",
    is_global: false,
    expires_at: ""
  });

  useEffect(() => {
    fetchAlerts();
    fetchUsers();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data as Alert[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('is_active', true);

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const createAlert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('alerts')
        .insert([{
          ...newAlert,
          user_id: newAlert.is_global ? null : (newAlert.user_id || null),
          expires_at: newAlert.expires_at || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert created successfully"
      });

      setShowNewAlert(false);
      setNewAlert({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        user_id: "",
        is_global: false,
        expires_at: ""
      });
      fetchAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      fetchAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });
      fetchAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (selectedTab === "unread") matchesTab = !alert.is_read;
    else if (selectedTab === "read") matchesTab = alert.is_read;
    else if (selectedTab === "global") matchesTab = alert.is_global;
    else if (selectedTab !== "all") matchesTab = alert.type === selectedTab;
    
    return matchesSearch && matchesTab;
  });

  const getTypeBadge = (type: string) => {
    const variants = {
      info: "default",
      warning: "secondary",
      error: "destructive",
      success: "outline"
    } as const;

    const icons = {
      info: Info,
      warning: AlertTriangle,
      error: X,
      success: CheckCircle
    };

    const Icon = icons[type as keyof typeof icons];

    return (
      <Badge variant={variants[type as keyof typeof variants]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive"
    } as const;

    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const canManageAlerts = ["chairman", "head-of-operations", "executive-assistant"].includes(userRole);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alert System</h1>
          <p className="text-muted-foreground mt-2">
            Manage system alerts and notifications
          </p>
        </div>
        {canManageAlerts && (
          <Dialog open={showNewAlert} onOpenChange={setShowNewAlert}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Alert Title</Label>
                  <Input
                    id="title"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                    placeholder="System maintenance scheduled"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                    placeholder="Detailed alert message..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newAlert.type}
                      onValueChange={(value) => setNewAlert({...newAlert, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newAlert.priority}
                      onValueChange={(value) => setNewAlert({...newAlert, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_global"
                    checked={newAlert.is_global}
                    onCheckedChange={(checked) => setNewAlert({...newAlert, is_global: checked, user_id: checked ? "" : newAlert.user_id})}
                  />
                  <Label htmlFor="is_global">Global Alert (visible to all users)</Label>
                </div>
                {!newAlert.is_global && (
                  <div>
                    <Label htmlFor="user_id">Send To User</Label>
                    <Select
                      value={newAlert.user_id}
                      onValueChange={(value) => setNewAlert({...newAlert, user_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="expires_at">Expires At (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={newAlert.expires_at}
                    onChange={(e) => setNewAlert({...newAlert, expires_at: e.target.value})}
                  />
                </div>
                <Button onClick={createAlert} className="w-full">
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => !a.is_read).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.is_global).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.priority === 'urgent').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
            <TabsTrigger value="error">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${!alert.is_read ? 'border-l-4 border-l-primary' : ''} ${isExpired(alert.expires_at) ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {alert.created_by} • {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(alert.priority)}
                      {getTypeBadge(alert.type)}
                      {alert.is_global && <Badge variant="outline">Global</Badge>}
                      {!alert.is_read && <Badge variant="secondary">Unread</Badge>}
                      {isExpired(alert.expires_at) && <Badge variant="destructive">Expired</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{alert.message}</p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {alert.user_id && (
                        <span>To: {alert.user_id}</span>
                      )}
                      {alert.expires_at && (
                        <span>Expires: {new Date(alert.expires_at).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!alert.is_read && (
                        <Button size="sm" variant="outline" onClick={() => markAsRead(alert.id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {canManageAlerts && (
                        <Button size="sm" variant="destructive" onClick={() => deleteAlert(alert.id)}>
                          <X className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No alerts found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}