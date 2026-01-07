export const getCurrentSeason = (): number => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JavaScript months are 0-based

    // Assuming the season starts in April
    return month >= 4 ? year : year - 1;
};
