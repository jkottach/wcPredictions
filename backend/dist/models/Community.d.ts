import mongoose, { Document } from 'mongoose';
export interface ICommunity extends Document {
    communityId: string;
    name: string;
    state: string;
    city: string;
    address: string;
    creationTime: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Community: mongoose.Model<ICommunity, {}, {}, {}, mongoose.Document<unknown, {}, ICommunity, {}, {}> & ICommunity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Community.d.ts.map