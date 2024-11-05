const reportModel = require('../model/reportModel');
const { calculatePagination, parsePageNumber, getPaginationData } = require('../pagination/paginationUtils');
const { formatDate } = require('../config/formatDate');

const reportService = {
    list: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        const pageQuery = req.query.page || 1;
        const currentPage = parsePageNumber(pageQuery);
        const itemsPerPage = 10; // 한 페이지당 이벤트 수

        const sortField = req.query.sort || 'R_NO';  // 기본값 R_NO (번호)
        const sortOrder = req.query.order || 'desc';  // 기본값 오름차순

        reportModel.getTotalReportCount((error, totalCount) => {
            if (error || totalCount === undefined || totalCount === null) {
                console.error(error);
                return res.render('report/list', { loginedAdmin: req.user, reports: [], pagination: {} });
            }

            const { totalPages, offset } = calculatePagination(totalCount, itemsPerPage, currentPage);
            const paginationData = getPaginationData(currentPage, totalPages, '/report/list');

            reportModel.getReports(offset, itemsPerPage, sortField, sortOrder, (error, reports) => {
                if (error) {
                    console.error(error);
                    return res.render('report/list', { loginedAdmin: req.user, reports: [], pagination: {} });
                }

                const formattedReports = reports.map(report => ({
                    ...report,
                    R_REG_DATE: formatDate(report.R_REG_DATE),
                    R_MOD_DATE: formatDate(report.R_MOD_DATE),
                }));

                console.log('reports:', formattedReports);

                res.render('report/list', {
                    loginedAdmin: req.user,
                    reports: formattedReports,
                    pagination: paginationData,
                    sortField, 
                    sortOrder
                });
            });
        });
    },

    reportCheck: (req, res) => {
        const reportId = req.params.id;
        const action = req.body.action;  // 요청 본문에서 action을 가져옴
    
        reportModel.getReportById(reportId, (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                return res.render('report/update_status_ng');
            }
    
            // 반려 처리
            if (action === 'reject') {
                const newStatus = 2;  // 반려 상태는 2
                reportModel.updateReportCheck(reportId, newStatus, (error) => {
                    if (error) {
                        console.error(error);
                        return res.render('report/update_status_ng');
                    }
                    res.status(200).send();  
                });
            } else {
                // 승인 처리 로직
                const currentStatus = result[0].R_CHECK;
                const newStatus = currentStatus === 1 ? 2 : 1;  // 1은 승인, 2는 반려
    
                if (newStatus === 1) {
                    const productId = result[0].R_P_NO;
                    reportModel.updateProductState(productId, 5, (error) => {  // P_STATE를 5로 업데이트
                        if (error) {
                            console.error(error);
                            return res.render('report/update_status_ng');
                        }
    
                        // 신고 상태도 1(승인)로 변경
                        reportModel.updateReportCheck(reportId, newStatus, (error) => {
                            if (error) {
                                console.error(error);
                                return res.render('report/update_status_ng');
                            }
                            res.redirect('/report/list');
                        });
                    });
                } else {
                    // 반려 시 R_CHECK만 변경
                    reportModel.updateReportCheck(reportId, newStatus, (error) => {
                        if (error) {
                            console.error(error);
                            return res.render('report/update_status_ng');
                        }
                        res.redirect('/report/list');
                    });
                }
            }
        });
    },
    

};

module.exports = reportService;
