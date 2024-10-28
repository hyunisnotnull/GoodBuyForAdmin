const gradeThresholds = {
    DIAMOND: 1600,
    PLATINUM: 1100,
    GOLD: 700,
    SILVER: 400,
    BRONZE: 200,
    IRON: 100,
    UNRANK: 0
};

const getGrade = (points) => {
    if (points >= gradeThresholds.DIAMOND) return 7; // DIAMOND
    if (points >= gradeThresholds.PLATINUM) return 6; // PLATINUM
    if (points >= gradeThresholds.GOLD) return 5; // GOLD
    if (points >= gradeThresholds.SILVER) return 4; // SILVER
    if (points >= gradeThresholds.BRONZE) return 3; // BRONZE
    if (points >= gradeThresholds.IRON) return 2; // IRON
    return 1; // UNRANK
};

module.exports = { getGrade, gradeThresholds };
