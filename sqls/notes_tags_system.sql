-- vim: set syntax=sql:
CREATE TABLE public.note_tags (
    id     SERIAL PRIMARY KEY,
    name   TEXT NOT NULL,

    note_counts INTEGER DEFAULT 0
);
CREATE INDEX note_tags_name_index ON public.note_tags (name);
CREATE INDEX note_tags_note_counts_index ON public.note_tags (note_counts);

DROP VIEW IF EXISTS public.notes_with_tag_names CASCADE;
CREATE VIEW public.notes_with_tag_names AS
    WITH exploded AS (
         SELECT
             notes.id,
             tag_id
         FROM
             public.notes
         CROSS JOIN UNNEST(notes.tags) AS tag_id
     )
     SELECT
         notes.*,
         ARRAY_AGG(note_tags.name) FILTER (WHERE note_tags.name IS NOT NULL) AS tag_names
     FROM
         public.notes
     LEFT JOIN
         exploded
     ON
         notes.id = exploded.id
     LEFT JOIN
         public.note_tags
     ON
         exploded.tag_id = note_tags.id
     GROUP BY
         notes.id;

DROP VIEW IF EXISTS public.notes_with_tags CASCADE;
CREATE VIEW public.notes_with_tags AS
    WITH exploded AS (
         SELECT
             notes.id,
             tag_id
         FROM
             public.notes
         CROSS JOIN UNNEST(notes.tags) AS tag_id
     )
     SELECT
         notes.*,
         JSON_AGG(
            json_build_object(
                 'id',
                 public.note_tags.id,
                 'name',
                 public.note_tags.name
            )
        )
     FROM
         public.notes
     LEFT JOIN
         exploded
     ON
         notes.id = exploded.id
     LEFT JOIN
         public.note_tags
     ON
         exploded.tag_id = note_tags.id
     GROUP BY
         notes.id;

DROP FUNCTION IF EXISTS public.get_and_maybe_insert_note_tags;
CREATE FUNCTION public.get_and_maybe_insert_note_tags(
    tag_names VARCHAR[]
) RETURNS INTEGER[] AS $$
    INSERT INTO
        public.note_tags
    (
        name
    )
    SELECT
        tag_name
    FROM
        UNNEST(tag_names) AS tag_name
    WHERE
        tag_name NOT IN (
            SELECT note_tags.name
            FROM public.note_tags
            WHERE note_tags.name = tag_name
        );

    SELECT
        ARRAY_AGG(note_tags.id) AS tags
    FROM
        UNNEST(tag_names) AS tag_name
    LEFT JOIN
        public.note_tags
    ON
        note_tags.name = tag_name;
$$ LANGUAGE SQL;

DROP FUNCTION IF EXISTS public.compute_note_tags_cache;
CREATE FUNCTION public.compute_note_tags_cache(
    tag_ids INTEGER[]
) RETURNS VOID AS $$
    UPDATE
        public.note_tags
    SET
        note_counts=note_count_computation.note_count
    FROM (
        SELECT
            note_tags.id AS note_tag_id,
            COUNT(notes.id) AS note_count
        FROM
            public.note_tags
        LEFT JOIN
            public.notes
        ON
            note_tags.id = ANY(notes.tags)
        WHERE
            note_tags.id = ANY(tag_ids)
        GROUP BY note_tags.id
    ) AS note_count_computation
    WHERE
        note_tags.id=note_count_computation.note_tag_id;
$$ LANGUAGE SQL;

DROP FUNCTION IF EXISTS public.compute_all_note_tags_cache;
CREATE FUNCTION public.compute_all_note_tags_cache(
) RETURNS VOID AS $$
    UPDATE
        public.note_tags
    SET
        note_counts=note_count_computation.note_count
    FROM (
        SELECT
            note_tags.id AS note_tag_id,
            COUNT(notes.id) AS note_count
        FROM
            public.note_tags
        LEFT JOIN
            public.notes
        ON
            note_tags.id = ANY(notes.tags)
        GROUP BY note_tags.id
    ) AS note_count_computation
    WHERE
        note_tags.id=note_count_computation.note_tag_id;
$$ LANGUAGE SQL;

DROP TRIGGER IF EXISTS on_note_tags_updated_then_compute_note_tags_cache ON public.notes;
DROP FUNCTION IF EXISTS public.on_note_tags_updated_then_compute_note_tags_cache();

CREATE FUNCTION public.on_note_tags_updated_then_compute_note_tags_cache() RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.compute_note_tags_cache(
        ARRAY(
            SELECT DISTINCT *
            FROM UNNEST(
                ARRAY_CAT(
                    OLD.tags,
                    NEW.tags
                )
            )
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE TRIGGER on_note_tags_updated_then_compute_note_tags_cache
    AFTER UPDATE
    ON public.notes
    FOR EACH ROW
    WHEN (OLD.tags IS DISTINCT FROM  NEW.tags)
    EXECUTE PROCEDURE public.on_note_tags_updated_then_compute_note_tags_cache();

DROP TRIGGER IF EXISTS on_note_tags_inserted_then_compute_note_tags_cache ON public.notes;
DROP FUNCTION IF EXISTS public.on_note_tags_inserted_then_compute_note_tags_cache();

CREATE FUNCTION public.on_note_tags_inserted_then_compute_note_tags_cache() RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.compute_note_tags_cache(NEW.tags);

    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE TRIGGER on_note_tags_inserted_then_compute_note_tags_cache
    AFTER INSERT
    ON public.notes
    FOR EACH ROW
    EXECUTE PROCEDURE public.on_note_tags_inserted_then_compute_note_tags_cache();

DROP TRIGGER IF EXISTS on_contacs_tags_deleted_then_compute_note_tags_cache ON public.notes;
DROP FUNCTION IF EXISTS public.on_contacs_tags_deleted_then_compute_note_tags_cache();

CREATE FUNCTION public.on_note_tags_deleted_then_compute_note_tags_cache() RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.compute_note_tags_cache(OLD.tags);
    RETURN NULL;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE TRIGGER on_note_tags_deleted_then_compute_note_tags_cache
    AFTER DELETE
    ON public.notes
    FOR EACH ROW
    EXECUTE PROCEDURE public.on_note_tags_deleted_then_compute_note_tags_cache();

DROP TRIGGER IF EXISTS on_note_tags_deleted_then_remove_tag_in_notes ON public.note_tags;
DROP FUNCTION IF EXISTS public.on_note_tags_deleted_then_remove_tag_in_notes();

CREATE FUNCTION public.on_note_tags_deleted_then_remove_tag_in_notes() RETURNS TRIGGER AS $$
BEGIN
    UPDATE
        public.notes
    SET
        tags=ARRAY_REMOVE(notes.tags, OLD.id)
    WHERE
        OLD.id = ANY(notes.tags);
    RETURN NULL;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE TRIGGER on_note_tags_deleted_then_remove_tag_in_notes
    AFTER DELETE
    ON public.note_tags
    FOR EACH ROW
    EXECUTE PROCEDURE public.on_note_tags_deleted_then_remove_tag_in_notes();

