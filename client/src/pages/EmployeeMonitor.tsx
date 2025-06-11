import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  Activity
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeMonitor() {
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
  });
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchInterval: 30000,
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/employees', newEmployee);
      
      setNewEmployee({ name: "", email: "", role: "" });
      setIsAddingEmployee(false);
      
      toast({
        title: "Employee Added",
        description: `${newEmployee.name} has been added to your team.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}m`;
  };

  const getPerformanceColor = (avgResponseTime?: number) => {
    if (!avgResponseTime) return 'text-gray-600';
    if (avgResponseTime <= 60) return 'text-green-600';
    if (avgResponseTime <= 120) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusColor = (employee: Employee) => {
    if (!employee.isActive) return 'bg-gray-50 border-gray-200';
    if (employee.avgResponseTime && employee.avgResponseTime > 120) {
      return 'bg-amber-50 border-amber-200';
    }
    return 'bg-green-50 border-green-200';
  };

  const getStatusText = (employee: Employee) => {
    if (!employee.isActive) return 'Away';
    if (employee.avgResponseTime && employee.avgResponseTime > 120) {
      return 'Delayed';
    }
    return 'Active';
  };

  const getStatusIcon = (employee: Employee) => {
    if (!employee.isActive) return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    if (employee.avgResponseTime && employee.avgResponseTime > 120) {
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const activeEmployees = employees.filter(e => e.isActive);
  const totalResponses = employees.reduce((sum, e) => sum + e.totalResponses, 0);
  const avgResponseTime = employees.length > 0 
    ? employees.reduce((sum, e) => sum + (e.avgResponseTime || 0), 0) / employees.length
    : 0;

  return (
    <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Monitor</h1>
              <p className="text-muted-foreground">Track team performance and response times</p>
            </div>
            <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
              <DialogTrigger asChild>
                <Button className="bg-sacura-primary hover:bg-sacura-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Employee name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="employee@company.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      placeholder="e.g., Customer Support, Manager"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddEmployee} className="flex-1">
                      Add Employee
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingEmployee(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                    <p className="text-sm text-muted-foreground">Team members</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                    <p className="text-2xl font-bold text-foreground">{activeEmployees.length}</p>
                    <p className="text-sm text-sacura-secondary">Online & responding</p>
                  </div>
                  <div className="w-12 h-12 bg-sacura-secondary/10 rounded-lg flex items-center justify-center">
                    <Activity className="text-sacura-secondary w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                    <p className="text-2xl font-bold text-foreground">{totalResponses}</p>
                    <p className="text-sm text-sacura-secondary">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-green-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold text-foreground">{formatTime(avgResponseTime)}</p>
                    <p className="text-sm text-muted-foreground">Team average</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-amber-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted-foreground/20 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-muted-foreground/20 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-muted-foreground/20 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-muted-foreground/20 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No employees added yet</h3>
                  <p className="mb-4">Add team members to start monitoring their performance</p>
                  <Button onClick={() => setIsAddingEmployee(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Employee
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(employee)}`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={employee.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`}
                          alt={employee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-foreground">{employee.name}</p>
                            {getStatusIcon(employee)}
                          </div>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Responses</p>
                            <p className="text-lg font-bold text-foreground">{employee.totalResponses}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                            <p className={`text-lg font-bold ${getPerformanceColor(employee.avgResponseTime)}`}>
                              {formatTime(employee.avgResponseTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge 
                              variant={employee.isActive ? "secondary" : "outline"}
                              className={
                                employee.isActive 
                                  ? employee.avgResponseTime && employee.avgResponseTime > 120
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {getStatusText(employee)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-sacura-primary" />
                <span>Performance Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Top Performers</h4>
                  <div className="space-y-2">
                    {employees
                      .filter(e => e.avgResponseTime && e.avgResponseTime <= 60)
                      .slice(0, 3)
                      .map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between text-sm">
                          <span className="text-blue-800">{employee.name}</span>
                          <span className="text-blue-600 font-medium">{formatTime(employee.avgResponseTime)}</span>
                        </div>
                      ))}
                    {employees.filter(e => e.avgResponseTime && e.avgResponseTime <= 60).length === 0 && (
                      <p className="text-sm text-blue-700">No top performers this period</p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">Needs Attention</h4>
                  <div className="space-y-2">
                    {employees
                      .filter(e => e.avgResponseTime && e.avgResponseTime > 120)
                      .slice(0, 3)
                      .map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between text-sm">
                          <span className="text-amber-800">{employee.name}</span>
                          <span className="text-amber-600 font-medium">{formatTime(employee.avgResponseTime)}</span>
                        </div>
                      ))}
                    {employees.filter(e => e.avgResponseTime && e.avgResponseTime > 120).length === 0 && (
                      <p className="text-sm text-amber-700">All employees performing well!</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
