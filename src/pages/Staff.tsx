import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Phone, Mail, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StaffRecord {
  id: string;
  user_id: string;
  employee_id: string;
  position: string;
  department: string;
  hire_date: string;
  salary?: number;
  manager_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  benefits?: string[];
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  manager?: {
    first_name: string;
    last_name: string;
  };
}

interface StaffProps {
  userRole: string;
}

export function Staff({ userRole }: StaffProps) {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  const [newStaff, setNewStaff] = useState({
    user_id: "",
    employee_id: "",
    position: "",
    department: "",
    hire_date: "",
    salary: "",
    manager_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    benefits: ""
  });

  useEffect(() => {
    fetchStaff();
    fetchUsers();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_records')
        .select(`
          *,
          profiles!staff_records_user_id_fkey (
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          manager:profiles!staff_records_manager_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff((data as StaffRecord[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch staff records",
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

  const createStaffRecord = async () => {
    try {
      const benefitsArray = newStaff.benefits
        ? newStaff.benefits.split(',').map(b => b.trim()).filter(Boolean)
        : [];

      const { error } = await supabase
        .from('staff_records')
        .insert([{
          ...newStaff,
          salary: newStaff.salary ? parseFloat(newStaff.salary) : null,
          manager_id: newStaff.manager_id || null,
          benefits: benefitsArray.length > 0 ? benefitsArray : null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff record created successfully"
      });

      setShowNewStaff(false);
      setNewStaff({
        user_id: "",
        employee_id: "",
        position: "",
        department: "",
        hire_date: "",
        salary: "",
        manager_id: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        benefits: ""
      });
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateStaffStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('staff_records')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff status updated"
      });
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredStaff = staff.filter(member => {
    const profile = member.profiles;
    const matchesSearch = 
      profile?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || member.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      terminated: "destructive",
      "on-leave": "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const canManageStaff = ["chairman", "head-of-operations", "executive-assistant"].includes(userRole);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage employee records and information
          </p>
        </div>
        {canManageStaff && (
          <Dialog open={showNewStaff} onOpenChange={setShowNewStaff}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_id">Select User</Label>
                  <Select
                    value={newStaff.user_id}
                    onValueChange={(value) => setNewStaff({...newStaff, user_id: value})}
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
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={newStaff.employee_id}
                    onChange={(e) => setNewStaff({...newStaff, employee_id: e.target.value})}
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                    placeholder="Senior Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                    placeholder="Operations"
                  />
                </div>
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={newStaff.hire_date}
                    onChange={(e) => setNewStaff({...newStaff, hire_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary (OMR)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})}
                    placeholder="3000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="manager_id">Manager</Label>
                  <Select
                    value={newStaff.manager_id}
                    onValueChange={(value) => setNewStaff({...newStaff, manager_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
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
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={newStaff.emergency_contact_name}
                    onChange={(e) => setNewStaff({...newStaff, emergency_contact_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={newStaff.emergency_contact_phone}
                    onChange={(e) => setNewStaff({...newStaff, emergency_contact_phone: e.target.value})}
                    placeholder="+968 9876 5432"
                  />
                </div>
                <div>
                  <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                  <Input
                    id="benefits"
                    value={newStaff.benefits}
                    onChange={(e) => setNewStaff({...newStaff, benefits: e.target.value})}
                    placeholder="Health Insurance, Annual Leave, etc."
                  />
                </div>
                <Button onClick={createStaffRecord} className="w-full">
                  Add Staff Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.status === 'on-leave').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(staff.map(s => s.department)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="on-leave">On Leave</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((member) => {
                const profile = member.profiles;
                return (
                  <Card key={member.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback>
                            {getInitials(profile?.first_name, profile?.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {profile?.first_name} {profile?.last_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {member.position}
                          </p>
                        </div>
                        {getStatusBadge(member.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">ID:</span>
                          <div>{member.employee_id}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Department:</span>
                          <div>{member.department}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {profile?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{profile.email}</span>
                          </div>
                        )}
                        {profile?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Hired: {new Date(member.hire_date).toLocaleDateString()}</span>
                        </div>
                        {member.salary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>OMR {member.salary.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {member.manager && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Manager:</span>
                          <div>{member.manager.first_name} {member.manager.last_name}</div>
                        </div>
                      )}

                      {member.benefits && member.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.benefits.slice(0, 2).map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                          {member.benefits.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.benefits.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {canManageStaff && (
                        <div className="pt-2">
                          <Select
                            value={member.status}
                            onValueChange={(value) => updateStaffStatus(member.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="on-leave">On Leave</SelectItem>
                              <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No staff members found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}