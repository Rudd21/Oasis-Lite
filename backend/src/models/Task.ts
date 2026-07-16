import { model, Schema } from "mongoose";


export interface ITask {
    title: string;
    description?: string;
    deadline: Date;
    status: 'pending' | 'completed';
    notified: boolean;
    createdAt: Date;
}

const taskSchema= new Schema<ITask>({
    title: {type: String, required: true},
    description: {type:String},
    deadline: {type: Date, required: true},
    status: {type: String, enum: ['pending', 'completed'], default: 'pending'},
    notified: {type: Boolean, default: false},
    createdAt: { type:Date, default: Date.now}
})

export const Task = model<ITask>('Task', taskSchema);