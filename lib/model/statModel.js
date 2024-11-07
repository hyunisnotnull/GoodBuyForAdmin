const DB = require('../db/db.js');

const statModel = {
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
    }
    
};

module.exports = statModel;
