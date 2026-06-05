'use client';

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Zap,
  Activity,
  Globe,
  Loader2,
  Settings2,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { formatINR } from "@/lib/format";

const CHART_DATA = [
  { name: 'Mon', students: 400, revenue: 2400 },
  { name: 'Tue', students: 300, revenue: 1398 },
  { name: 'Wed', students: 200, revenue: 9800 },
  { name: 'Thu', students: 278, revenue: 3908 },
  { name: 'Fri', students: 189, revenue: 4800 },
  { name: 'Sat', students: 239, revenue: 3800 },
  { name: 'Sun', students: 349, revenue: 4300 },
];

const DUMMY_COURSES = [
  { name: 'Product Design' },
  { name: 'Web Development' },
  { name: 'Marketing Automation' },
];

const DUMMY_USERS = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
];

export default function SupportDashboard() {
  const [usersCount, setUsersCount] = useState<number | string>('...');
  const [coursesCount, setCoursesCount] = useState<number | string>('...');
  const [revenue, setRevenue] = useState<number>(45231);
  const [latency, setLatency] = useState<string>('1.2ms');
  const [chartData, setChartData] = useState<any[]>(CHART_DATA);
  const [logs, setLogs] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setUsersCount(data.usersCount);
          setCoursesCount(data.coursesCount);
          setRevenue(data.revenueValue);
          setLatency(data.latencyValue);
          if (data.chartData) setChartData(data.chartData);
          if (data.logs) setLogs(data.logs);
        }
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    const timer = setTimeout(() => setIsInitializing(false), 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center space-y-8"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }}
              className="relative h-24 w-24"
            >
              <div className="absolute inset-0 rounded-full border-4 border-muted/20" />
              <div className="absolute inset-0 rounded-full border-t-4 border-muted" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Settings2 className="h-10 w-10 text-foreground" />
              </div>
            </motion.div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-headline font-bold tracking-tight animate-pulse text-foreground">Initializing Orchestration Engine</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em]">Admin Console v2.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-muted/10">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6 sticky top-0 z-50">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="font-headline font-bold text-xl tracking-tight text-foreground">Admin Console v2.0</h1>
                <Badge variant="outline" className="text-[10px] h-5 bg-muted/5 text-foreground border-muted/20 font-bold uppercase">System: Nominal</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border" />
                <Button size="sm" className="bg-muted text-foreground shadow-lg shadow-muted/20 font-bold">
                  <Zap className="mr-2 h-4 w-4" /> Initialize Update
                </Button>
              </div>
            </div>
          </header>
          
          <main className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Identity Entities" 
                value={String(usersCount)} 
                icon={Users} 
                trend="+12.5%" 
                description="Authenticated students"
              />
              <StatCard 
                title="Curriculum Units" 
                value={String(coursesCount)} 
                icon={FileText} 
                trend="+8 new" 
                description="Course modules active"
              />
              <StatCard 
                title="Revenue Stream" 
                value={formatINR(revenue)}
                icon={BarChart3} 
                trend="+8.4%" 
                description="Monthly recurring"
                color="text-green-600"
              />
              <StatCard 
                title="Engine Latency" 
                value={latency} 
                icon={Zap} 
                trend="Optimal" 
                description="Core processing speed"
                color="text-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-2xl border-primary/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
                  <div>
                    <CardTitle className="font-headline text-xl">Student Engagement Cycle</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest font-bold">Real-time platform activity</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-bold">7-DAY METRIC</Badge>
                </CardHeader>
                <CardContent className="h-[350px] mt-4 p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-primary/5 rounded-[2rem] overflow-hidden flex flex-col">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="font-headline text-xl">Traffic Orchestration</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest font-bold">User acquisition channels</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-2xl border-primary/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-xl">Administrative Orchestration Logs</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest font-bold">Recent system-level modifications</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold uppercase tracking-widest">Full History</Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {logs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-background border-2 border-transparent hover:border-muted/20 transition-all group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted/5 flex items-center justify-center text-foreground group-hover:bg-muted group-hover:text-white transition-all">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-foreground transition-colors">{log.action}</p>
                          <p className="text-xs text-muted-foreground font-medium">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground">{log.user}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end font-bold">
                          <Clock className="h-3 w-3" />
                          {log.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

function StatCard({ title, value, icon: Icon, trend, description, color }: any) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="overflow-hidden border-muted/5 group shadow-lg rounded-[2rem]">
        <CardContent className="pt-8 p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
              <h3 className="text-4xl font-headline font-bold text-foreground">{value}</h3>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="h-5 bg-muted/5 text-foreground text-[10px] border-none font-bold uppercase">
                  <TrendingUp className="h-3 w-3 mr-1" /> {trend}
                </Badge>
              </div>
            </div>
            <div className={cn("bg-muted/5 p-4 rounded-2xl transition-all group-hover:bg-muted group-hover:text-white group-hover:rotate-6", color)}>
              <Icon className="h-7 w-7" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-6 flex items-center gap-1 font-bold uppercase tracking-widest">
            <ArrowUpRight className="h-3 w-3 text-foreground" /> {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
