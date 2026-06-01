export { auth as middleware } from "./lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/:path*",
    "/templates/:path*",
    "/settings/:path*",
  ],
};
