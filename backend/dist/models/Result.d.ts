import mongoose, { Document } from 'mongoose';
export interface IResult extends Document {
    userId: string;
    userName: string;
    matchId: string;
    matchTag: string;
    result: 'win' | 'loss' | 'draw';
    matchPoints: number;
    finalPoints: number;
    communityId1?: string;
    communityId2?: string;
    dailyRank: number;
    finalRank: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Result: mongoose.Model<IResult, {}, {}, {}, mongoose.Document<unknown, {}, IResult, {}, {}> & IResult & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Result.d.ts.map