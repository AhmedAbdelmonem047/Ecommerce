import mongoose, { DeleteResult, HydratedDocument, Model, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";

export class DBRepo<TDocument> {
    constructor(protected readonly model: Model<TDocument>) { }
    async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
        return await this.model.create(data);
    }
    async find(filter: RootFilterQuery<TDocument>, select?: ProjectionType<TDocument>, options?: QueryOptions<TDocument>): Promise<HydratedDocument<TDocument>[]> {
        return await this.model.find(filter, select, options);
    }
    async findOne(filter: RootFilterQuery<TDocument>, projection?: ProjectionType<TDocument>, options?: QueryOptions<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOne(filter, projection, options);
    }
    async updateOne(filter: RootFilterQuery<TDocument>, update: UpdateQuery<TDocument>): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, update);
    }
    async findOneAndUpdate(filter: RootFilterQuery<TDocument>, update: UpdateQuery<TDocument>, options: QueryOptions<TDocument> | null = { new: true }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async findOneAndDelete(filter: RootFilterQuery<TDocument>, options: QueryOptions<TDocument> | null = { new: true }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndDelete(filter, options);
    }
    async deleteOne(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }
    async deleteMany(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }
    async findByIdAndDelete(id: mongoose.Schema.Types.ObjectId, options?: QueryOptions<TDocument>) {
        return await this.model.findByIdAndDelete(id, options);
    }
    async findById(id: any, projection?: ProjectionType<TDocument> | null, options?: QueryOptions<TDocument> | null) {
        return this.model.findById(id, projection, options);
    }
    async getAllPaginated({ filter, query, select, options }: { filter: RootFilterQuery<TDocument>, query: { page: number, limit: number }, select?: ProjectionType<TDocument>, options?: QueryOptions<TDocument> }) {
        let { page, limit } = query
        if (page < 0) page = 1;
        page = page * 1 || 1;
        const skip = (page - 1) * limit;
        const finalOptions = { ...options, page, limit };
        const count = await this.model.countDocuments({ deletedAt: { $exists: false } });
        const docs = await this.model.find(filter, select, finalOptions);
        return { docs, currentPage: page, count, numOfPages: (Math.ceil(count / limit)) };

    }
}