export type UserMarketingEntry = {
    id: string;
    user_login: string;
    user_email: string;
    display_name: string;
    user_registered: string;
    how_found?: string | null;
    last_login?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    is_member?: boolean | null;
};

export type UserMarketingData = UserMarketingEntry[];
