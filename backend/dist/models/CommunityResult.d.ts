import mongoose, { Document } from 'mongoose';
export interface ICommunityResult extends Document {
    communityId: string;
    communityWeightagePoint: number;
    matchId: string;
    matchTag: string;
    communityMatchPoint: number;
    totalCommunityPoint: number;
    dailyRank: number;
    finalRank: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CommunityResult: mongoose.Model<ICommunityResult, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityResult, {}, {}> & ICommunityResult & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CommunityResult.d.ts.map