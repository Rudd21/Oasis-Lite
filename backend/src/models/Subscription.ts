import mongoose,{ Schema } from "mongoose";


export interface ISubscription {
    endpoint: string;
    keys:{
        p256dh: string;
        auth: string;
    },
    createdAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
    endpoint: {type: String, required: true, unique: true},
    keys:{
        p256dh:{type:String, required: true},
        auth: {type:String, required: true}
    },
    createdAt:{type:Date, default: Date.now}
});

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
