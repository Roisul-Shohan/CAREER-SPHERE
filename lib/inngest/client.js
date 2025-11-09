import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "career-coach", // Unique app ID
  name: "Career Coach",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
