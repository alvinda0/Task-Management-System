function getPagination(page = 1, limit = 10) {
  const currentPage = Number(page);
  const currentLimit = Number(limit);

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