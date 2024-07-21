import sql from "$lib/server/db.js";

export async function handle({ event, resolve }) {
    await sql`SELECT 1`;
    event.locals.sql = await sql.reserve();
    const response = await resolve(event);
    event.locals.sql.release();
    return response;
}
