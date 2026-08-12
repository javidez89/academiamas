create index if not exists platform_admins_created_by_idx
  on private.platform_admins (created_by)
  where created_by is not null;
