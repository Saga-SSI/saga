export default {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN || "https://charmed-ant-74.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
