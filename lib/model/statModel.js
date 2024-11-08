const DB = require('../db/db.js');

const statModel = {

    // 카테고리별 판매 데이터
    getCategorySalesData: (age, sex, rank, callback) => {
        let sql = `
            SELECT 
                C.C_NAME AS category_name, 
                COUNT(*) AS product_count
            FROM 
                TBL_PRODUCT P
            JOIN 
                TBL_USER U ON P.P_OWNER_ID = U.U_ID
            JOIN
                TBL_CATEGORY C ON P.P_CATEGORY = C.C_NO  
            WHERE 
                P.P_STATE = 3
        `;
        const params = [];

        if (age !== 'all') {
            sql += ` AND U.U_AGE = ?`;
            params.push(age);
        }

        if (sex !== 'all') {
            sql += ` AND U.U_SEX = ?`;
            params.push(sex);
        }

        if (rank !== 'all') {
            sql += ` AND U.U_CLASS = ?`;
            params.push(rank);
        }

        sql += ` GROUP BY C.C_NAME ORDER BY product_count DESC`;

        DB.query(sql, params, (error, results) => {
            if (error) {
                console.error('SQL Error:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    // 필터 옵션 데이터 (연령대, 성별, 랭크)
    getFilterOptions: (callback) => {
        let ageSql = 'SELECT DISTINCT U_AGE AS age FROM TBL_USER WHERE U_AGE IS NOT NULL';
        let sexSql = 'SELECT DISTINCT U_SEX AS sex FROM TBL_USER WHERE U_SEX IS NOT NULL';
        let rankSql = 'SELECT CL_NO, CL_NAME FROM TBL_CLASS ORDER BY CL_NO';

        let filterData = {};

        DB.query(ageSql, (error, ageResults) => {
            if (error) {
                console.error('Age query error:', error);
                return callback(error, null);
            }
            filterData.age = ageResults;

            DB.query(sexSql, (error, sexResults) => {
                if (error) {
                    console.error('Sex query error:', error);
                    return callback(error, null);
                }
                filterData.sex = sexResults;

                DB.query(rankSql, (error, rankResults) => {
                    if (error) {
                        console.error('Rank query error:', error);
                        return callback(error, null);
                    }
                    filterData.rank = rankResults;

                    callback(null, filterData);
                });
            });
        });
    }
};

module.exports = statModel;
