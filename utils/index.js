const { sign } = require('jsonwebtoken');

// delete properties from a source object
exports.deleteProps = (src, ...props) => {
  props.forEach(prop => delete src[prop]);
};

// make sure all passed values are truthy
exports.validate = (...values) => values.every(value => !!value);

// async catcher. helps to avoid using try catch everywhere
exports.catchAsync = func => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

exports.validateTags = tags => {
  if (typeof tags === 'string') return [tags];
  return tags.filter(tag => typeof tag === 'string' && !!tag);
};

// generate a token for a given client id
exports.generateToken = id => sign({ id }, process.env.JWT_SECRET);

// create pages array out of a number of pages
const createPages = numPages => {
  let firstPage = 1;
  const pages = [];
  for (let i = firstPage; i <= numPages; i++) {
    pages.push(i);
  }
  return pages;
};

// pagination implementation
exports.paginate = (items = [], currentPage = 1, resultsPerPage = 10) => {
  // default number of results per page
  const defaultResultsPerPage = 10;
  // total number of documents
  const itemsLength = items.length;
  // first page, always 1
  const firstPage = 1;

  // sanitize input as currentPage and resultsPerPage could be anything given it's provided by client
  if (
    !Number.isNaN(parseInt(currentPage)) ||
    !Number.isNaN(parseInt(resultsPerPage))
  ) {
    currentPage = 1;
    resultsPerPage = defaultResultsPerPage;
  }

  // don't allow resultsPerpage to exceed the total number of documents we have
  if (resultsPerPage > itemsLength) resultsPerPage = itemsLength;
  // don't allow resultsPerpage to be less than defaultResultsPerPage for every page
  if (resultsPerPage < defaultResultsPerPage)
    resultsPerPage = defaultResultsPerPage;

  // total number of pages
  let pageLength = Math.ceil(itemsLength / resultsPerPage);
  // make sure pageLength is not less than firstPage
  pageLength = pageLength > firstPage ? pageLength : firstPage;
  // last page which is page length
  const lastPage = pageLength;
  // pages read from current page
  const pagesRead = currentPage > firstPage ? currentPage - firstPage : 0;
  // pages left to read from current page
  const pagesToRead = currentPage < lastPage ? lastPage - currentPage : 0;

  // don't allow currentPage to be bigger than the total number of pages there are
  if (currentPage > pageLength) currentPage = pageLength;
  // don't allow currentPage to be less than firstPage which is 1
  if (currentPage < firstPage) currentPage = firstPage;

  // check if there's a previous page from currentPage
  const hasPreviousPage = currentPage > firstPage;
  // check if there's a next page from currentPage
  const hasNextPage = currentPage < lastPage;
  // if prevPage decrease currentPage by 1 to compute the previousPage, else set to null
  const previousPage = hasPreviousPage ? currentPage - 1 : null;
  // if nextPage, increase currentPage by 1 to compute nextPage, else set to null
  const nextPage = hasNextPage ? currentPage + 1 : null;
  // index from which to start copying docs
  const startIdx = (currentPage - 1) * resultsPerPage;
  // index to stop copying docs
  const endIdx = currentPage * resultsPerPage;
  // paged docs
  const documents = items.slice(startIdx, endIdx);
  // length of paged docs
  const totalDocuments = documents.length;
  // pagination information
  return {
    firstPage,
    lastPage,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    documents,
    pageLength,
    pagesRead,
    pagesToRead,
    totalDocuments,
    pages: createPages(pageLength),
    resultsPerPage,
  };
};

// check if two value are the same
exports.same = (first, second) => first === second;

// assign values from source to target
exports.assign = (source, target) => {
  for (let key in source) {
    const value = source[key];
    if (value) target[key] = value;
  }
  return true;
};

// escape function
const escape = text => {
  const charTable = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quote;',
    "'": '&apos;',
  };
  return text.replace(/(<|>|'|"|&)/g, match => charTable[match]);
};

module.exports = exports;
