// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Yeh paths protect honge, agar tu aur bhi add karna chahe toh array mein daal
export const config = {
  matcher: ["/saved-documents", "/view/:path*"],
};
