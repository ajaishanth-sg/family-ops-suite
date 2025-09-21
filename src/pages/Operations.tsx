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
import { CheckSquare, Plus, Calendar, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Checklist {
  id: string;
  title: string;
  description?: string;
  category: string;
  assigned_to?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completed_at?: string;
  completed_by?: string;
  created_by: string;
  created_at: string;
  assignee?: {
    first_name: string;
    last_name: string;
  };
  creator?: {
    first_name: string;
    last_name: string;
  };
}

interface OperationsProps {
  userRole: string;
}

export function Operations({ userRole }: OperationsProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewChecklist, setShowNewChecklist] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  const [newChecklist, setNewChecklist] = useState({
    title: "",
    description: "",
    category: "",
    assigned_to: "",
    due_date: "",
    priority: "medium"
  });

  useEffect(() => {
    fetchChecklists();
    fetchUsers();
  }, []);

  const fetchChecklists = async () => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          assignee:profiles!checklists_assigned_to_fkey (
            first_name,
            last_name
          ),
          creator:profiles!checklists_created_by_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChecklists((data as Checklist[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch checklists",
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

  const createChecklist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('checklists')
        .insert([{
          ...newChecklist,
          assigned_to: newChecklist.assigned_to || null,
          due_date: newChecklist.due_date || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Checklist created successfully"
      });

      setShowNewChecklist(false);
      setNewChecklist({
        title: "",
        description: "",
        category: "",
        assigned_to: "",
        due_date: "",
        priority: "medium"
      });
      fetchChecklists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateChecklistStatus = async (id: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      const { error } = await supabase
        .from('checklists')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Checklist ${status}`
      });
      fetchChecklists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = 
      checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || checklist.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      "in-progress": "default",
      completed: "outline",
      overdue: "destructive"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
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

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const canManageChecklists = ["chairman", "head-of-operations"].includes(userRole);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Operational Checklists</h1>
          <p className="text-muted-foreground mt-2">
            Manage daily operations and task assignments
          </p>
        </div>
        <Dialog open={showNewChecklist} onOpenChange={setShowNewChecklist}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Checklist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newChecklist.title}
                  onChange={(e) => setNewChecklist({...newChecklist, title: e.target.value})}
                  placeholder="Daily maintenance check"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newChecklist.category}
                  onChange={(e) => setNewChecklist({...newChecklist, category: e.target.value})}
                  placeholder="Maintenance, Security, etc."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newChecklist.description}
                  onChange={(e) => setNewChecklist({...newChecklist, description: e.target.value})}
                  placeholder="Detailed task description..."
                />
              </div>
              <div>
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  value={newChecklist.assigned_to}
                  onValueChange={(value) => setNewChecklist({...newChecklist, assigned_to: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newChecklist.due_date}
                    onChange={(e) => setNewChecklist({...newChecklist, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newChecklist.priority}
                    onValueChange={(value) => setNewChecklist({...newChecklist, priority: value})}
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
              <Button onClick={createChecklist} className="w-full">
                Create Checklist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklists.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists.filter(c => c.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists.filter(c => c.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search checklists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredChecklists.map((checklist) => (
              <Card key={checklist.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{checklist.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Category: {checklist.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(checklist.priority)}
                      {getStatusBadge(checklist.status)}
                      {isOverdue(checklist.due_date) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklist.description && (
                    <p className="text-sm text-muted-foreground">{checklist.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {checklist.assignee && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {checklist.assignee.first_name} {checklist.assignee.last_name}
                        </span>
                      </div>
                    )}
                    {checklist.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isOverdue(checklist.due_date) ? "text-red-500" : ""}>
                          Due: {new Date(checklist.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {checklist.creator && (
                      <div className="text-xs text-muted-foreground">
                        Created by: {checklist.creator.first_name} {checklist.creator.last_name}
                      </div>
                    )}
                  </div>

                  {checklist.completed_at && (
                    <div className="text-xs text-muted-foreground">
                      Completed: {new Date(checklist.completed_at).toLocaleString()}
                    </div>
                  )}

                  {checklist.status !== 'completed' && (
                    <div className="flex gap-2 pt-2">
                      {checklist.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateChecklistStatus(checklist.id, 'in-progress')}
                        >
                          Start
                        </Button>
                      )}
                      {checklist.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateChecklistStatus(checklist.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredChecklists.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No checklists found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}