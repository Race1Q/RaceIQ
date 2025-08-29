export interface Driver {
    id?: number; // optional, since Supabase will usually auto-generate
    driver_number: number | null;
    first_name: string;
    last_name: string;
    name_acronym: string | null;
    country_code: string | null;
    date_of_birth: string; // keep as string since Ergast API returns YYYY-MM-DD
}