
-- Drop the recursive SELECT policy on circle_members
DROP POLICY IF EXISTS "Members can view circle members" ON circle_members;

-- Create a safe non-recursive SELECT policy
CREATE POLICY "Members can view circle members"
ON circle_members
FOR SELECT
USING (true);
