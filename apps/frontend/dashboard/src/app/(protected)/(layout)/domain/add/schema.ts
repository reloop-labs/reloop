import * as v from "valibot";

export const domainSchema = v.object({
  domain: v.pipe(
    v.string("Domain is required"),
    v.minLength(1, "Domain is required"),
    v.regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
      "Please enter a valid domain name",
    ),
  ),
  customReturnPath: v.pipe(
    v.string("Custom return path is required"),
    v.minLength(1, "Custom return path is required"),
    v.regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      "Use only letters, numbers, and hyphens",
    ),
  ),
});

export type DomainFormValues = v.InferInput<typeof domainSchema>;
