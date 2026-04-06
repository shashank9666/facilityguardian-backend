import { Schema, model, Document, Types } from "mongoose";

interface IChecklistItem {
  _id?: Types.ObjectId;
  task: string;
  completed: boolean;
  notes?: string;
}

export interface IPMSchedule extends Document {
  title: string;
  assetId: Types.ObjectId;
  assetName: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "semi-annual" | "annual";
  lastCompleted?: Date;
  nextDue: Date;
  assignedTo: string;
  estimatedMinutes: number;
  checklist: IChecklistItem[];
  status: "active" | "paused" | "overdue";
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    task:      { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes:     String,
  },
  { _id: true }
);

const PMScheduleSchema = new Schema<IPMSchedule>(
  {
    title:            { type: String, required: true, trim: true },
    assetId:          { type: Schema.Types.ObjectId, ref: "Asset", required: true },
    assetName:        { type: String, required: true, trim: true },
    frequency:        { type: String, required: true, enum: ["daily","weekly","monthly","quarterly","semi-annual","annual"] },
    lastCompleted:    { type: Date },
    nextDue:          { type: Date, required: true },
    assignedTo:       { type: String, trim: true, default: "" },
    estimatedMinutes: { type: Number, min: 0, default: 60 },
    checklist:        [ChecklistItemSchema],
    status:           { type: String, enum: ["active","paused","overdue"], default: "active" },
  },
  { timestamps: true }
);

export const PMSchedule = model<IPMSchedule>("PMSchedule", PMScheduleSchema);
