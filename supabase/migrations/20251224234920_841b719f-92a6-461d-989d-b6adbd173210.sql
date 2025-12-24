-- Make evaluation-evidence bucket private
UPDATE storage.buckets SET public = false WHERE id = 'evaluation-evidence';