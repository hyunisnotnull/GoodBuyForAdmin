const gradeThresholds = {
    DIAMOND: 600,
    PLATINUM: 500,
    GOLD: 400,
    SILVER: 300,
    BRONZE: 200,
    IRON: 100,
    STOP: 0
};

const getGrade = (points) => {
    if (points >= gradeThresholds.DIAMOND) return 7; // DIAMOND
    if (points >= gradeThresholds.PLATINUM) return 6; // PLATINUM
    if (points >= gradeThresholds.GOLD) return 5; // GOLD
    if (points >= gradeThresholds.SILVER) return 4; // SILVER
    if (points >= gradeThresholds.BRONZE) return 3; // BRONZE
    if (points >= gradeThresholds.IRON) return 2; // IRON
    return 1; // STOP
};

module.exports = { getGrade, gradeThresholds };
