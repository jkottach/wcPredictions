import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    status: 'active' | 'inactive' | 'suspended';
    creationTime: Date;
    whatsappNumber?: string;
    city: string;
    state: string;
    country: string;
    comment?: string;
    communityId1?: string;
    communityId2?: string;
    isActive: boolean;
    googleId?: string;
    instagramId?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map