import mongoose, { Document } from 'mongoose';
export interface ITeam extends Document {
    teamId: string;
    teamName: string;
    country: string;
    coach: string;
    foundedYear: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Team: mongoose.Model<ITeam, {}, {}, {}, mongoose.Document<unknown, {}, ITeam, {}, {}> & ITeam & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Team.d.ts.map