function getPagination(page = 1, limit = 10) {
  const currentPage = parseInt(page, 10);
  const currentLimit = parseInt(limit, 10);

  return {
    limit: currentLimit,
    offset: (currentPage - 1) * currentLimit,
    page: currentPage,
  };
}

function getPaginationMetadata(page, limit, total) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}

module.exports = {
  getPagination,
  getPaginationMetadata,
};