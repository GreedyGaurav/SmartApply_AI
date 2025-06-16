"use client";

import { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
  { title: "Generate Resume", icon: FileText, href: "/" },
  {
    title: "Generate Cover Letter",
    icon: Mail,
    href: "/cover-letter",
    active: true,
  },
  { title: "Saved Documents", icon: Save, href: "/saved-documents" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

interface CoverLetterFormData {
  fullName: string;
  targetJobRole: string;
  companyName: string;
  experienceSummary: string;
  skills: string[];
  whyGoodFit: string;
  tone: string;
}

export default function GenerateCoverLetter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState<CoverLetterFormData>({
    fullName: "",
    targetJobRole: "",
    companyName: "",
    experienceSummary: "",
    skills: [],
    whyGoodFit: "",
    tone: "",
  });

  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Auth redirect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render until Clerk is loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  if (!isSignedIn) return null;

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

  const handleInputChange = (
    field: keyof CoverLetterFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateCoverLetter = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
    setShowPreview(true);
  };

  const getToneGreeting = () => {
    switch (formData.tone) {
      case "formal":
        return "Dear Hiring Manager,";
      case "friendly":
        return "Hello there,";
      case "enthusiastic":
        return "Dear Hiring Team,";
      default:
        return "Dear Hiring Manager,";
    }
  };

  const getToneClosing = () => {
    switch (formData.tone) {
      case "formal":
        return "Sincerely,";
      case "friendly":
        return "Best regards,";
      case "enthusiastic":
        return "Excited to hear from you,";
      default:
        return "Sincerely,";
    }
  };

  const generateCoverLetterContent = () => {
    const greeting = getToneGreeting();
    const closing = getToneClosing();

    let openingLine = "";
    let enthusiasm = "";
    let conclusion = "";

    switch (formData.tone) {
      case "formal":
        openingLine = `I am writing to express my interest in the ${formData.targetJobRole} position at ${formData.companyName}.`;
        enthusiasm =
          "I believe my professional background aligns well with your requirements.";
        conclusion =
          "I would welcome the opportunity to discuss how my experience can contribute to your team's success.";
        break;
      case "friendly":
        openingLine = `I'm excited to apply for the ${formData.targetJobRole} role at ${formData.companyName}!`;
        enthusiasm = "I think we'd be a great match, and here's why:";
        conclusion =
          "I'd love to chat more about how I can help your team achieve its goals.";
        break;
      case "enthusiastic":
        openingLine = `I am thrilled to submit my application for the ${formData.targetJobRole} position at ${formData.companyName}!`;
        enthusiasm = "I'm genuinely excited about this opportunity because:";
        conclusion =
          "I can't wait to bring my passion and skills to your incredible team!";
        break;
      default:
        openingLine = `I am writing to express my interest in the ${formData.targetJobRole} position at ${formData.companyName}.`;
        enthusiasm =
          "I believe my professional background aligns well with your requirements.";
        conclusion =
          "I would welcome the opportunity to discuss how my experience can contribute to your team's success.";
    }

    return {
      greeting,
      openingLine,
      enthusiasm,
      conclusion,
      closing,
    };
  };

  const letterContent = generateCoverLetterContent();

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
              <h1 className="text-xl font-semibold">Generate Cover Letter</h1>
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
            <div className="mx-auto max-w-4xl space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Generate Your AI-Powered Cover Letter
                </h2>
                <p className="text-muted-foreground mt-2">
                  Create a personalized cover letter that highlights your
                  strengths and matches the job requirements.
                </p>
              </div>

              {/* Cover Letter Generation Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetJobRole">Target Job Role *</Label>
                      <Input
                        id="targetJobRole"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.targetJobRole}
                        onChange={(e) =>
                          handleInputChange("targetJobRole", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., Google, Microsoft, Startup Inc."
                        value={formData.companyName}
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Letter Tone *</Label>
                      <Select
                        value={formData.tone}
                        onValueChange={(value) =>
                          handleInputChange("tone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">
                            Formal - Professional and traditional
                          </SelectItem>
                          <SelectItem value="friendly">
                            Friendly - Warm and approachable
                          </SelectItem>
                          <SelectItem value="enthusiastic">
                            Enthusiastic - Energetic and passionate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceSummary">
                      Experience Summary *
                    </Label>
                    <Textarea
                      id="experienceSummary"
                      placeholder="Briefly describe your relevant work experience and key achievements..."
                      className="min-h-[120px]"
                      value={formData.experienceSummary}
                      onChange={(e) =>
                        handleInputChange("experienceSummary", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Skills *</Label>
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
                    <Label htmlFor="whyGoodFit">Why You're a Good Fit *</Label>
                    <Textarea
                      id="whyGoodFit"
                      placeholder="Explain why you're the perfect candidate for this role and company. What makes you stand out?"
                      className="min-h-[120px]"
                      value={formData.whyGoodFit}
                      onChange={(e) =>
                        handleInputChange("whyGoodFit", e.target.value)
                      }
                    />
                  </div>

                  <Button
                    onClick={handleGenerateCoverLetter}
                    disabled={isGenerating}
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Cover Letter...
                      </>
                    ) : (
                      "Generate Cover Letter"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Cover Letter Preview */}
              {showPreview && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Cover Letter Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white border rounded-lg p-8 shadow-sm max-w-3xl mx-auto">
                        <div className="space-y-6 text-gray-800 leading-relaxed">
                          {/* Header */}
                          <div className="text-right">
                            <div className="font-semibold">
                              {formData.fullName || "Your Name"}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>

                          {/* Greeting */}
                          <div>
                            <div className="font-medium">
                              {letterContent.greeting}
                            </div>
                          </div>

                          {/* Opening Paragraph */}
                          <div>
                            <p>
                              {letterContent.openingLine}{" "}
                              {letterContent.enthusiasm}
                            </p>
                          </div>

                          {/* Experience Paragraph */}
                          {formData.experienceSummary && (
                            <div>
                              <p>{formData.experienceSummary}</p>
                            </div>
                          )}

                          {/* Skills Paragraph */}
                          {formData.skills.length > 0 && (
                            <div>
                              <p>
                                My key strengths include{" "}
                                {formData.skills.slice(0, -1).join(", ")}
                                {formData.skills.length > 1 &&
                                  ` and ${
                                    formData.skills[formData.skills.length - 1]
                                  }`}
                                {formData.skills.length === 1 &&
                                  formData.skills[0]}
                                , which I believe will be valuable assets to
                                your team.
                              </p>
                            </div>
                          )}

                          {/* Why Good Fit Paragraph */}
                          {formData.whyGoodFit && (
                            <div>
                              <p>{formData.whyGoodFit}</p>
                            </div>
                          )}

                          {/* Closing Paragraph */}
                          <div>
                            <p>
                              {letterContent.conclusion} Thank you for
                              considering my application.
                            </p>
                          </div>

                          {/* Sign-off */}
                          <div className="space-y-4">
                            <div>{letterContent.closing}</div>
                            <div className="font-semibold">
                              {formData.fullName || "Your Name"}
                            </div>
                          </div>
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
                          // 👇 Normalized fields
                          title: `${
                            formData.fullName || "Untitled"
                          } Cover Letter`,
                          type: "cover-letter", // 👈 This is how filter works
                          jobRole: formData.targetJobRole || "Unknown Role",
                          company: formData.companyName || "Unknown Company",
                          style: formData.tone || "Formal",
                          content: html || "<div>No Content</div>",
                        }),
                      });

                      if (res.ok) {
                        alert("✅ Cover Letter saved successfully!");
                      } else {
                        alert("❌ Failed to save cover letter");
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
                  >
                    Save Cover Letter
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
