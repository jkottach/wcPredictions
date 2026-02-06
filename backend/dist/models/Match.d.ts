import mongoose, { Document } from 'mongoose';
export interface IMatch extends Document {
    matchId: string;
    sequence: number;
    team1: string;
    team2: string;
    team1Score?: number;
    team2Score?: number;
    matchTime: Date;
    predictionsEndingTime: Date;
    round: number;
    comment?: string;
    matchTag: string;
    status: 'scheduled' | 'ongoing' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Match: mongoose.Model<IMatch, {}, {}, {}, mongoose.Document<unknown, {}, IMatch, {}, {}> & IMatch & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Match.d.ts.map