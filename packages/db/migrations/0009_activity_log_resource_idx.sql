CREATE INDEX "activity_log_idx_org_resource" ON "activity_log" USING btree ("organization_id","resource_type","resource_id","created_at");
