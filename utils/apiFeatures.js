export default class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    search() {
        const keyword = this.queryStr.keyword ?
            {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i"
                }
            }
            : {};
        // console.log(keyword);
        console.log(this.queryStr)
        this.query = this.query.find({ ...keyword })
        return this;
    }
    filter() {
        const queryCopy = { ...this.queryStr }

        const removeFields = ['keyword', 'page', 'limit'];

        removeFields.forEach((field) => delete queryCopy[field])

        let queryStr = JSON.stringify(queryCopy)
        // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`)

        // console.log(queryStr)
        // this.query = this.query.find(JSON.parse(queryStr))
        this.query = this.query.find((queryCopy))

        return this;
    }
    pagination(producPage) {
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = producPage * (currentPage - 1);

        this.query = this.query.limit(producPage).skip(skip)

        return this;
    }
}