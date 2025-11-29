const filterFields = (fields, ...notAllowedFields) => {
  const filteredFields = {};//This Object will hold the final result
  const fieldKeys = Object.keys(fields);//[email,password,role]
  
  fieldKeys.forEach(curField => notAllowedFields.includes(curField) ? '' :filteredFields[curField] = fields[curField] );
  return filteredFields;
}

module.exports = filterFields;