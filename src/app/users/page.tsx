'use client';

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  enrolledCourses?: string[];
  createdAt?: string;
}

const roles = ['student', 'instructor', 'moderator', 'admin', 'super_admin'];

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [activeMainSection, setActiveMainSection] = useState<"teacher" | "student" | null>("teacher");
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await db.auth.getUser();
      if (user) {
        const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser({
          ...user,
          ...profile
        });
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await db.from('profiles').select('*').order('full_name', { ascending: true });
    if (error) {
      setError(error.message);
      setUsers([]);
    } else {
      setUsers((data || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.name || 'Anonymous',
        role: profile.role || 'student',
        enrolledCourses: profile.enrolled_courses || [],
        createdAt: profile.created_at ? new Date(profile.created_at).toLocaleString() : 'Unknown',
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    // Only the superadmin can modify roles
    const isSuperAdmin = currentUser?.email === 'admin@xmartycreator.com';
    if (!isSuperAdmin) {
      alert("Unauthorized. Only the Super Admin (admin@xmartycreator.com) can modify roles!");
      return;
    }

    setLoading(true);
    setError("");
    const { error } = await db.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      setError(error.message);
    } else {
      setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, role: newRole } : user));
    }
    setLoading(false);
  };

  const removeUser = async (userId: string) => {
    const isSuperAdmin = currentUser?.email === 'admin@xmartycreator.com';
    if (!isSuperAdmin) {
      alert("Unauthorized. Only the Super Admin can delete users!");
      return;
    }

    if (!confirm('Delete user profile and associated role data? This cannot be undone.')) return;
    setLoading(true);
    setError("");
    const { error } = await db.from('profiles').delete().eq('id', userId);
    if (error) {
      setError(error.message);
    } else {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
    setLoading(false);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) {
      alert("Please fill in Name and Email!");
      return;
    }
    setIsCreating(true);
    setError("");
    
    const userId = 'user_' + Math.random().toString(36).substring(2, 11);
    const newUserDoc = {
      id: userId,
      email: newUserEmail,
      full_name: newUserName,
      role: newUserRole,
      enrolled_courses: [],
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await db.from('profiles').insert(newUserDoc);
      if (error) throw new Error(error.message);
      
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('student');
      setShowCreateForm(false);
      await fetchUsers();
      alert("User registered successfully!");
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsCreating(false);
    }
  };

  // Filter lists based on roles
  const teachers = users.filter(u => ['instructor', 'teacher', 'moderator'].includes(u.role || ''));
  const students = users.filter(u => ['student', 'user'].includes(u.role || ''));

  // Authorization check
  const isSuperAdmin = currentUser?.email === 'admin@xmartycreator.com';

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 border-amber-200/40 dark:border-amber-500/10">
          <SidebarTrigger />
          <div>
            <h1 className="font-headline font-bold text-xl text-slate-900 dark:text-white">User Directory</h1>
            <p className="text-xs text-muted-foreground">Manage student and teacher platform roles.</p>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          <Card className="border-amber-200/50 dark:border-amber-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-headline">Access Directory</CardTitle>
                <CardDescription>Live user listings from database with role selectors.</CardDescription>
              </div>
              {isSuperAdmin && (
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-amber-500 hover:bg-amber-600 shadow-md text-white font-bold rounded-xl">
                  {showCreateForm ? 'Cancel' : 'Register / Add User'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Super Admin Registration Form */}
              {isSuperAdmin && showCreateForm && (
                <form onSubmit={createUser} className="mb-8 p-6 rounded-[2rem] border border-amber-200 dark:border-amber-500/20 bg-amber-500/[0.02] space-y-4">
                  <h3 className="font-headline text-lg font-bold text-amber-800 dark:text-yellow-400">Register New Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="John Doe" 
                        className="w-full h-11 px-4 rounded-xl border bg-background focus:ring-1 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                      <input 
                        type="email" 
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="john@example.com" 
                        className="w-full h-11 px-4 rounded-xl border bg-background focus:ring-1 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Role</label>
                       <Select value={newUserRole} onValueChange={(val) => setNewUserRole(val)}>
                         <SelectTrigger className="w-full h-11 px-4 rounded-xl border bg-background focus:ring-1 focus:ring-amber-500 outline-none">
                           <SelectValue placeholder="Select Role" />
                         </SelectTrigger>
                         <SelectContent>
                           {roles.map(r => (
                             <SelectItem key={r} value={r}>{r}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={isCreating} className="bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold">
                      {isCreating ? 'Creating Profile...' : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              )}

              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* TAP-TO-EXPAND USER SECTIONS */}
              <div className="space-y-4">
                
                {/* 1. TEACHERS SECTION */}
                <div className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden bg-background shadow-sm">
                  <button 
                    onClick={() => setActiveMainSection(activeMainSection === "teacher" ? null : "teacher")}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-yellow-500 border border-amber-500/20">
                        <i className="fa-solid fa-chalkboard-user text-lg"></i>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">Teachers / Instructors</h3>
                        <p className="text-xs text-muted-foreground">List of certified platform instructors ({teachers.length} active).</p>
                      </div>
                    </div>
                    <i className={`fa-solid ${activeMainSection === "teacher" ? "fa-chevron-up" : "fa-chevron-down"} text-muted-foreground`}></i>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeMainSection === "teacher" && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                      >
                        <div className="p-6">
                          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-background">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Joined</TableHead>
                                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {teachers.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-bold">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                      <select
                                        disabled={!isSuperAdmin}
                                        value={user.role}
                                        onChange={(e) => changeRole(user.id, e.target.value)}
                                        className="rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-80 disabled:cursor-not-allowed"
                                      >
                                        {roles.map((r) => (
                                          <option key={r} value={r}>{r}</option>
                                        ))}
                                      </select>
                                    </TableCell>
                                    <TableCell>{user.createdAt}</TableCell>
                                    {isSuperAdmin && (
                                      <TableCell>
                                        <Button size="sm" variant="destructive" onClick={() => removeUser(user.id)}>Delete</Button>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. STUDENTS SECTION */}
                <div className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden bg-background shadow-sm">
                  <button 
                    onClick={() => setActiveMainSection(activeMainSection === "student" ? null : "student")}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <i className="fa-solid fa-graduation-cap text-lg"></i>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">Students</h3>
                        <p className="text-xs text-muted-foreground">List of active platform students ({students.length} active).</p>
                      </div>
                    </div>
                    <i className={`fa-solid ${activeMainSection === "student" ? "fa-chevron-up" : "fa-chevron-down"} text-muted-foreground`}></i>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeMainSection === "student" && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                      >
                        <div className="p-6">
                          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-background">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Enrolled Courses</TableHead>
                                  <TableHead>Joined</TableHead>
                                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {students.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-bold">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                      <select
                                        disabled={!isSuperAdmin}
                                        value={user.role}
                                        onChange={(e) => changeRole(user.id, e.target.value)}
                                        className="rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-80 disabled:cursor-not-allowed"
                                      >
                                        {roles.map((r) => (
                                          <option key={r} value={r}>{r}</option>
                                        ))}
                                      </select>
                                    </TableCell>
                                    <TableCell>{user.enrolledCourses?.join(', ') || 'None'}</TableCell>
                                    <TableCell>{user.createdAt}</TableCell>
                                    {isSuperAdmin && (
                                      <TableCell>
                                        <Button size="sm" variant="destructive" onClick={() => removeUser(user.id)}>Delete</Button>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
