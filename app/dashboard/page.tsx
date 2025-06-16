"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Save,
  Settings,
  User,
  LogOut,
  Download,
} from "lucide-react";
import Link from "next/link";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    active: true,
  },
  { title: "Generate Resume", icon: FileText, href: "/" },
  { title: "Generate Cover Letter", icon: Mail, href: "/cover-letter" },
  { title: "Saved Documents", icon: Save, href: "/saved-documents" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

interface Document {
  _id: string;
  title: string;
  type: "resume" | "cover-letter";
  dateCreated: string | Date;
  company?: string;
  jobRole?: string;
  style?: string;
  content?: string;
  downloads?: number;
}

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Document stats state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Auth redirect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch("/api/saved-documents");
        const data = await res.json();
        const parsedDocs = data.map((doc: any) => ({
          ...doc,
          dateCreated: new Date(doc.createdAt),
        }));
        setDocuments(parsedDocs);
      } catch (e) {
        setDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    };
    if (isSignedIn) fetchDocuments();
  }, [isSignedIn]);

  if (!isLoaded || loadingDocs) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  if (!isSignedIn) return null;

  // Stats
  const totalDocs = documents.length;
  const totalResumes = documents.filter((d) => d.type === "resume").length;
  const totalCoverLetters = documents.filter(
    (d) => d.type === "cover-letter"
  ).length;
  // If you have a downloads field, sum it; else, just show totalDocs as a placeholder
  const totalDownloads = documents.reduce(
    (sum, d) => sum + (d.downloads || 0),
    0
  );

  // Recent activity: sort by dateCreated desc, take 3
  const recentDocs = [...documents]
    .sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated))
    .slice(0, 3);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">SmartApply AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-6">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    className="w-full justify-start"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Top Navbar */}
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          user?.imageUrl ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        alt="User"
                      />
                      <AvatarFallback>
                        {user?.firstName?.[0] ?? "U"}
                        {user?.lastName?.[0] ?? ""}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{user?.fullName || "Profile"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <Separator className="my-1" />
                  <DropdownMenuItem asChild>
                    <SignOutButton>
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </div>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-6xl space-y-8">
              {/* Welcome Section */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
                </h2>
                <p className="text-muted-foreground mt-2">
                  Here's an overview of your document generation activity.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Documents
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalDocs}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalDocs === 1
                        ? "1 document"
                        : `${totalDocs} documents`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Resumes
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalResumes}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalResumes === 1
                        ? "1 resume"
                        : `${totalResumes} resumes`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cover Letters
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalCoverLetters}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalCoverLetters === 1
                        ? "1 cover letter"
                        : `${totalCoverLetters} cover letters`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Downloads
                    </CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalDownloads}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalDownloads === 1
                        ? "1 download"
                        : `${totalDownloads} downloads`}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/">
                      <Button
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                      >
                        <FileText className="h-6 w-6" />
                        <span>Generate Resume</span>
                      </Button>
                    </Link>
                    <Link href="/cover-letter">
                      <Button
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                      >
                        <Mail className="h-6 w-6" />
                        <span>Generate Cover Letter</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDocs.length === 0 && (
                      <div className="text-muted-foreground text-sm">
                        No recent activity yet.
                      </div>
                    )}
                    {recentDocs.map((doc) => (
                      <div className="flex items-center gap-4" key={doc._id}>
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            doc.type === "resume"
                              ? "bg-blue-100"
                              : "bg-green-100"
                          }`}
                        >
                          {doc.type === "resume" ? (
                            <FileText className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Mail className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Created{" "}
                            {new Date(doc.dateCreated).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
