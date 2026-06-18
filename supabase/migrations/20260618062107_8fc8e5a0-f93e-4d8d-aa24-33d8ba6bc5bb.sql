-- Allow active members (not just admins) to approve pending members
CREATE POLICY "Members can approve pending"
ON public.memberships
FOR UPDATE
TO authenticated
USING (is_project_member(project_id) AND role = 'pending'::project_role)
WITH CHECK (is_project_member(project_id) AND role = 'member'::project_role);

-- Allow active members to reject (remove) pending members
CREATE POLICY "Members can reject pending"
ON public.memberships
FOR DELETE
TO authenticated
USING (is_project_member(project_id) AND role = 'pending'::project_role);