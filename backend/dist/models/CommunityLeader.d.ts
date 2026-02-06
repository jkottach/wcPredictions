import mongoose, { Document } from 'mongoose';
export interface ICommunityLeader extends Document {
    rank: number;
    totalPoints: number;
    communityName: string;
    communityId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CommunityLeader: mongoose.Model<ICommunityLeader, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityLeader, {}, {}> & ICommunityLeader & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CommunityLeader.d.ts.map