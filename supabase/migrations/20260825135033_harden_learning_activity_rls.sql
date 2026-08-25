drop policy if exists learning_activity_sessions_select_own
  on private.learning_activity_sessions;
create policy learning_activity_sessions_select_own
  on private.learning_activity_sessions
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
