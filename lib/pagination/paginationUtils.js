const calculatePagination = (totalItems, itemsPerPage, currentPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;

    return { totalPages, offset };
};

const parsePageNumber = (pageQuery) => {
    const page = parseInt(pageQuery);
    return isNaN(page) ? 1 : page; 
};

const getPaginationData = (currentPage, totalPages, baseUrl) => {
    const pageRange = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageRange.push(i);
    }

    return {
        currentPage,
        totalPages,
        pageRange,
        baseUrl,
    };
};

module.exports = { calculatePagination, parsePageNumber, getPaginationData };
