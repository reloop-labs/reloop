# Workflow Service API

[Read more about the service](https://reloop.sh/docs/setup/backend/workflow)

## 🔗 Quick Links

- 📚 **Documentation**: [Developer Docs](https://reloop.sh/dev/workflow-service)
- 🌐 **Production API**: [API Base](https://reloop.sh/api/workflow)
- 📜 **OpenAPI Spec**: [OpenAPI](https://reloop.sh/api/workflow/openapi)
- 📊 **Workbench**: [Jobs UI](https://local.reloop.sh/api/workflow/jobs)

## 🚀 Setup

For detailed setup and development instructions, please refer to the [Setup Guide](https://reloop.sh/docs/setup/backend/workflow).

## Workflow job handler contract

All BullMQ jobs on `workflow-queue` follow this default flow. Helpers live in `src/queues/workflow-job.ts`.

1. **Accept the job** — handlers take `job: WorkflowJob` (plus domain-specific args).
2. **Log milestones** — use `logJob(job, "...")` so progress shows in the Workbench / queue UI.
3. **Retryable failures** — after persisting retryable state, call `failJobOrRetry({ job, isLastAttempt, message, why, fix })`, which throws `createWorkflowError` (`createError` with `message` / `why` / `fix`) so BullMQ retries.
4. **Final attempt** — persist terminal status first, then `failJobOrRetry` (it logs the fix and returns without throwing).
5. **Use `isLastAttempt(job)`** from the shared module (the worker already passes this into handlers).

Current job types: `verify-domain`, `deliver-webhook`.

---

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/workflow)
- 🤖 **Discovery**: [Discovery Spec](https://reloop.sh/api/workflow/agent-card.json)
- 📖 **OpenAPI**: [OpenAPI Spec](https://reloop.sh/api/workflow/openapi)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
- 🛠️ **Setup**: [Setup Guide](https://reloop.sh/docs/setup/backend/workflow)
