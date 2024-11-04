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

        reportModel.getTotalReportCount((error, totalCount) => {
            if (error || totalCount === undefined || totalCount === null) {
                console.error(error);
                return res.render('report/list', { loginedAdmin: req.user, reports: [], pagination: {} });
            }

            const { totalPages, offset } = calculatePagination(totalCount, itemsPerPage, currentPage);
            const paginationData = getPaginationData(currentPage, totalPages, '/report/list');

            reportModel.getReports(offset, itemsPerPage, (error, reports) => {
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
                    pagination: paginationData
                });
            });
        });
    },

    reportStatus: (req, res) => {
        const reportId = req.params.id;

        reportModel.getReportById(reportId, (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                return res.render('report/update_status_ng');
            }

            const currentStatus = result[0].E_ACTIVE;
            const newStatus = currentStatus === 1 ? 2 : 1; // 1는 활성화, 2은 비활성화

            reportModel.updateReportStatus(eventId, newStatus, (error) => {
                if (error) {
                    console.error(error);
                    return res.render('report/update_status_ng');
                }
                res.redirect('/report/list');
            });
        });
    },

};

module.exports = reportService;
