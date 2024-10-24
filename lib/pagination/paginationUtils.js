const calculatePagination = (totalItems, itemsPerPage, currentPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;

    return { totalPages, offset };
};

const parsePageNumber = (pageQuery) => {
    const page = parseInt(pageQuery);
    return isNaN(page) ? 1 : page; 
};

module.exports = { calculatePagination, parsePageNumber };