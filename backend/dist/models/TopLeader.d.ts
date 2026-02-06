import mongoose, { Document } from 'mongoose';
export interface ITopLeader extends Document {
    rank: number;
    totalPoints: number;
    name: string;
    state: string;
    community1?: string;
    community2?: string;
    userId: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TopLeader: mongoose.Model<ITopLeader, {}, {}, {}, mongoose.Document<unknown, {}, ITopLeader, {}, {}> & ITopLeader & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TopLeader.d.ts.map