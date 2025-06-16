"use client";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  X,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";

const navigationItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Generate Resume", icon: FileText, href: "/", active: false },
  {
    title: "Generate Cover Letter",
    icon: Mail,
    href: "/cover-letter",
    active: false,
  },
  {
    title: "Saved Documents",
    icon: Save,
    href: "/saved-documents",
    active: false,
  },
  { title: "Settings", icon: Settings, href: "/settings", active: false },
];

interface FormData {
  name: string;
  jobTitle: string;
  experience: string;
  education: string;
  skills: string[];
  certifications: string;
  role: string;
  style: string;
}

export default function Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    jobTitle: "",
    experience: "",
    education: "",
    skills: [],
    certifications: "",
    role: "",
    style: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  // Set active navigation item based on current path
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const navItems = navigationItems.map((item) => ({
    ...item,
    active: item.href === currentPath,
  }));

  // Only show sign-in modal when needed
  const handleGenerateResume = async () => {
    if (!isSignedIn) {
      // Open Clerk sign-in modal
      if (typeof window !== "undefined" && clerk.openSignIn) {
        clerk.openSignIn();
      }
      return;
    }
    if (!validateForm()) return;
    setIsGenerating(true);
    setFormError(null);
    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Try to extract error message from API response
        let errorMsg = "Failed to generate resume. Please try again.";
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // ignore JSON parse error
        }
        setFormError(errorMsg);
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      // Optionally: set generated resume data to state for preview
      setShowPreview(true);
    } catch (error) {
      setFormError(
        "Network error. Please check your connection and try again."
      );
      console.error("Failed to generate resume:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate required fields before generating resume
  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.jobTitle.trim() ||
      !formData.experience.trim() ||
      !formData.education.trim() ||
      formData.skills.length === 0 ||
      !formData.role.trim() ||
      !formData.style.trim()
    ) {
      setFormError("Please fill all required fields marked with *.");
      return false;
    }
    setFormError(null);
    return true;
  };

  // Remove the early return for !isSignedIn (so page is always visible)
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

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
              {navItems.map((item) => (
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
              <h1 className="text-xl font-semibold">Generate Resume</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Clerk User Info */}
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

                  {/* Sign Out Button */}
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
            <div className="mx-auto max-w-4xl space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Generate Your AI-Powered Resume
                </h2>
                <p className="text-muted-foreground mt-2">
                  Fill in your details below and let our AI create a
                  professional resume tailored to your desired role.
                </p>
              </div>
              {/* Show form error if any */}
              {formError && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                  {formError}
                </div>
              )}
              {/* Resume Generation Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Resume Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Current Job Title *</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Software Engineer"
                        value={formData.jobTitle}
                        onChange={(e) =>
                          handleInputChange("jobTitle", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Work Experience *</Label>
                    <Textarea
                      id="experience"
                      placeholder="Describe your work experience, achievements, and responsibilities..."
                      className="min-h-[120px]"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education *</Label>
                    <Textarea
                      id="education"
                      placeholder="List your educational background, degrees, institutions..."
                      className="min-h-[100px]"
                      value={formData.education}
                      onChange={(e) =>
                        handleInputChange("education", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills *</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {skill}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">
                      Certifications (Optional)
                    </Label>
                    <Textarea
                      id="certifications"
                      placeholder="List any relevant certifications, licenses, or professional credentials..."
                      value={formData.certifications}
                      onChange={(e) =>
                        handleInputChange("certifications", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="role">Desired Role / Industry *</Label>
                      <Input
                        id="role"
                        placeholder="e.g., Senior Frontend Developer"
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resume Style *</Label>
                      <Select
                        value={formData.style}
                        onValueChange={(value) =>
                          handleInputChange("style", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateResume}
                    disabled={isGenerating}
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Resume...
                      </>
                    ) : (
                      "Generate Resume"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Resume Preview */}
              {showPreview && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Resume Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white border rounded-lg p-8 shadow-sm">
                        <div className="space-y-6">
                          {/* Header */}
                          <div className="text-center border-b pb-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                              {formData.name || "Your Name"}
                            </h1>
                            <p className="text-lg text-gray-600 mt-1">
                              {formData.jobTitle || "Your Job Title"}
                            </p>
                          </div>

                          {/* Desired Role */}
                          {formData.role && (
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Objective
                              </h2>
                              <p className="text-gray-700">
                                Seeking a position as {formData.role} where I
                                can leverage my skills and experience to
                                contribute to organizational success.
                              </p>
                            </div>
                          )}

                          {/* Experience */}
                          {formData.experience && (
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Work Experience
                              </h2>
                              <div className="text-gray-700 whitespace-pre-line">
                                {formData.experience}
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {formData.education && (
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Education
                              </h2>
                              <div className="text-gray-700 whitespace-pre-line">
                                {formData.education}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {formData.skills.length > 0 && (
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Skills
                              </h2>
                              <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certifications */}
                          {formData.certifications && (
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Certifications
                              </h2>
                              <div className="text-gray-700 whitespace-pre-line">
                                {formData.certifications}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <button
                    onClick={async () => {
                      const html =
                        document.querySelector(".bg-white")?.outerHTML;

                      const res = await fetch("/api/save-document", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          title: `${formData.name || "Untitled"} Resume`,
                          type: "resume",
                          jobRole: formData.jobTitle || "Unknown Role",
                          style: formData.style || "Basic",
                          content: html || "<div>No Content</div>",
                        }),
                      });

                      if (res.ok) {
                        alert("✅ Resume saved successfully!");
                      } else {
                        alert("❌ Failed to save resume");
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded shadow"
                  >
                    Save Resume
                  </button>
                </>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
