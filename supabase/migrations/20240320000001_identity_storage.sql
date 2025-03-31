-- Create identity-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-documents', 'identity-documents', false);

-- Storage policies for identity-documents bucket
CREATE POLICY "Users can upload their own ID documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'identity-documents' AND
        auth.uid() = (storage.foldername(name))[1]::uuid
    );

CREATE POLICY "Users can view their own ID documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'identity-documents' AND
        auth.uid() = (storage.foldername(name))[1]::uuid
    );

CREATE POLICY "Admins can view all ID documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'identity-documents' AND
        auth.jwt() ->> 'role' = 'admin'
    );

-- Function to validate ID document uploads
CREATE OR REPLACE FUNCTION validate_id_document_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the file is in the correct user's folder
    IF auth.uid() != (storage.foldername(NEW.name))[1]::uuid THEN
        RAISE EXCEPTION 'Invalid upload path';
    END IF;

    -- Validate file type (only allow images)
    IF NOT (NEW.metadata->>'mimetype' LIKE 'image/%') THEN
        RAISE EXCEPTION 'Only image files are allowed';
    END IF;

    -- Validate file size (max 5MB)
    IF (NEW.metadata->>'size')::integer > 5242880 THEN
        RAISE EXCEPTION 'File size must be less than 5MB';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ID document upload validation
CREATE TRIGGER validate_id_document_upload_trigger
    BEFORE INSERT ON storage.objects
    FOR EACH ROW
    WHEN (NEW.bucket_id = 'identity-documents')
    EXECUTE FUNCTION validate_id_document_upload(); 