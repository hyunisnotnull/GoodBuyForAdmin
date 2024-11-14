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
    console.log("Points:", points);
    if (points >= gradeThresholds.DIAMOND) {
        console.log("Grade: DIAMOND");
        return 6;
    }
    if (points >= gradeThresholds.PLATINUM) {
        console.log("Grade: PLATINUM");
        return 5;
    }
    if (points >= gradeThresholds.GOLD) {
        console.log("Grade: GOLD");
        return 4;
    }
    if (points >= gradeThresholds.SILVER) {
        console.log("Grade: SILVER");
        return 3;
    }
    if (points >= gradeThresholds.BRONZE) {
        console.log("Grade: BRONZE");
        return 2;
    }
    if (points >= gradeThresholds.IRON) {
        console.log("Grade: IRON");
        return 1;
    }
    console.log("Grade: UNRANK");
    return 0;
};


module.exports = { getGrade, gradeThresholds };
