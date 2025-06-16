"use client";

import { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation"; // 👈 add this at the top
import html2pdf from "html2pdf.js";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Save,
  Settings,
  User,
  LogOut,
  Eye,
  Download,
  Trash2,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const navigationItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Generate Resume", icon: FileText, href: "/" },
  { title: "Generate Cover Letter", icon: Mail, href: "/cover-letter" },
  {
    title: "Saved Documents",
    icon: Save,
    href: "/saved-documents",
    active: true,
  },
  { title: "Settings", icon: Settings, href: "/settings" },
];

interface Document {
  _id: string;
  title: string;
  type: "resume" | "cover-letter";
  dateCreated: string; // or Date
  company?: string;
  jobRole?: string;
  style?: string;
  content?: string;
}

export default function SavedDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "resume" | "cover-letter"
  >("all");

  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const res = await fetch("/api/saved-documents");
      const data = await res.json();

      const parsedDocs = data.map((doc: any) => ({
        ...doc,
        dateCreated: new Date(doc.createdAt), // 👈 convert string to Date object
      }));

      setDocuments(parsedDocs);
    };

    fetchDocuments();
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/save-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "My Resume",
        type: "resume",
        jobRole: "Frontend Developer",
        company: "Google",
        style: "Modern",
        content: "<html>....</html>", // optional
      }),
    });

    const data = await res.json();
    setDocuments((prev) => [...prev, data]); // Add new doc to UI
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/delete-document", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        console.log("✅ Document deleted from server.");
        setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      } else {
        console.error("❌ Failed to delete:", await res.text());
      }
    } catch (err) {
      console.error("❌ Error during delete:", err);
    }
  };

  const handleView = (document: Document) => {
    router.push(`/view/${document._id}`); // 👈 navigate to dynamic view page
  };

  const handleDownload = async (doc: any) => {
    if (typeof window === "undefined") return; // 🚫 Avoid SSR crash

    const html2pdf = (await import("html2pdf.js")).default;

    if (!doc.content) {
      console.error("❌ No content to download.");
      return;
    }

    const container = document.createElement("div");
    container.innerHTML = doc.content;
    document.body.appendChild(container); // temporarily render content

    const opt = {
      margin: 0.5,
      filename: `${doc.title.replace(/\s+/g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        document.body.removeChild(container); // clean-up after download
      });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.jobRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDocumentIcon = (type: "resume" | "cover-letter") => {
    return type === "resume" ? FileText : Mail;
  };

  const getDocumentTypeLabel = (type: "resume" | "cover-letter") => {
    return type === "resume" ? "Resume" : "Cover Letter";
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  if (!isSignedIn) return null;

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
              <h1 className="text-xl font-semibold">Saved Documents</h1>
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
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Your Documents
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Manage and access all your generated resumes and cover
                    letters.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New
                  </Button>
                </div>
              </div>

              {/* Search and Filter Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={filterType}
                        onValueChange={(value: any) => setFilterType(value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Documents</SelectItem>
                          <SelectItem value="resume">Resumes Only</SelectItem>
                          <SelectItem value="cover-letter">
                            Cover Letters Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Grid */}
              {filteredDocuments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-center space-y-4">
                      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          No documents found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm || filterType !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Start by creating your first resume or cover letter."}
                        </p>
                      </div>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((document) => {
                    const DocumentIcon = getDocumentIcon(document.type);
                    return (
                      <Card
                        key={document._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <DocumentIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold truncate">
                                  {document.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {getDocumentTypeLabel(document.type)}
                                  </Badge>
                                  {document.style && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {document.style}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Document Details */}
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {document.jobRole && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Role:</span>
                                  <span>{document.jobRole}</span>
                                </div>
                              )}
                              {document.company && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Company:</span>
                                  <span>{document.company}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Created:</span>
                                <span>{formatDate(document.dateCreated)}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(document)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View document</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(document)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download PDF</span>
                                </Button>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">
                                      Delete document
                                    </span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Document
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "
                                      {document.title}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(document._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Summary Stats */}
              {filteredDocuments.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Showing {filteredDocuments.length} of {documents.length}{" "}
                        documents
                      </span>
                      <div className="flex gap-4">
                        <span>
                          {documents.filter((d) => d.type === "resume").length}{" "}
                          Resumes
                        </span>
                        <span>
                          {
                            documents.filter((d) => d.type === "cover-letter")
                              .length
                          }{" "}
                          Cover Letters
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
