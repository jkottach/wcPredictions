import mongoose, { Document } from 'mongoose';
export interface IPrediction extends Document {
    userId: string;
    email: string;
    matchId: string;
    matchTag: string;
    team1Score: number;
    team2Score: number;
    submittedTime: Date;
    points: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Prediction: mongoose.Model<IPrediction, {}, {}, {}, mongoose.Document<unknown, {}, IPrediction, {}, {}> & IPrediction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Prediction.d.ts.map