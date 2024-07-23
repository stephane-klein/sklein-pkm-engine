\o /dev/null
SET client_min_messages TO error;
CREATE EXTENSION IF NOT EXISTS age;
LOAD 'age';
SET search_path = ag_catalog, "$user", public;

-- Delete graph only if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM ag_catalog.ag_graph WHERE name = 'graph') THEN
        PERFORM drop_graph('graph', true);
    END IF;
END $$;
SELECT create_graph('graph');

DROP TABLE IF EXISTS public.notes;

-- public.notes table

CREATE TABLE public.notes (
    id          SERIAL PRIMARY KEY,
    nanoid      VARCHAR(12) UNIQUE NOT NULL,
    filename    VARCHAR(255) UNIQUE NOT NULL,
    note_type   VARCHAR DEFAULT NULL,
    content     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX notes_id_index        ON public.notes (id);
CREATE INDEX notes_nanoid_index    ON public.notes (nanoid);
CREATE INDEX notes_filename_index  ON public.notes (filename);
CREATE INDEX notes_note_type_index ON public.notes (note_type);
