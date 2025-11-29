const filterFields = require("./filterFields");

class APIFeatures{
  constructor(query,queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let filteredQueryStr = filterFields(this.queryString, 'sort', 'limit', 'skip', 'fields');
    
    filteredQueryStr = JSON.stringify(filteredQueryStr).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(filteredQueryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort)  this.query = this.query.sort(this.queryString.sort)  
    else this.query = this.query.sort('-createdAt');
  
    return this;
  }
  limit() {
    if (this.queryString.limit && (Number(this.queryString.limit) > 0) ) 
      this.query = this.query.limit(Number(this.queryString.limit))

    return this;
  }
  fields() {
    if (this.queryString.fields)
      this.query = this.query.select(this.queryString.fields);
      return this;
  }
  paginate() {
    if (this.queryString.skip && (Number(this.queryString.skip) > 0)) {
      const page = Number(this.queryString.page )|| 1;//2
      const limit = Number(this.queryString.limit) || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit)

    }
    return this;
  }
}

module.exports = APIFeatures;