import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL);

const main = (async() => {
    await sql`SELECT 1`;  // Executed to test that database access works correctly as soon as the app is launched
});

main();

export default sql;
