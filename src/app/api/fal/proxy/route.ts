import { createRouteHandler } from "@fal-ai/server-proxy/nextjs";

export const { GET, POST, PUT } = createRouteHandler({
  allowedEndpoints: [
    "fal-ai/flux-2/turbo",
    "minimax/h3-max-turbo/**",
    "minimax/h3-max/**",
  ],
});
