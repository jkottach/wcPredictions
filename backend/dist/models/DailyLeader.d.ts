import mongoose, { Document } from 'mongoose';
export interface IDailyLeader extends Document {
    rank: number;
    totalPoints: number;
    name: string;
    state: string;
    community1?: string;
    community2?: string;
    userId: string;
    email: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DailyLeader: mongoose.Model<IDailyLeader, {}, {}, {}, mongoose.Document<unknown, {}, IDailyLeader, {}, {}> & IDailyLeader & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=DailyLeader.d.ts.map