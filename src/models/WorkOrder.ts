import { Schema, model, Document, Types } from "mongoose";

interface IAuditEntry {
  action: string;
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

export interface IWorkOrder extends Document {
  woNumber: string;
  title: string;
  description: string;
  type: "corrective" | "preventive" | "inspection" | "emergency";
  status: "open" | "assigned" | "in_progress" | "on_hold" | "completed" | "cancelled";
  priority: "critical" | "high" | "medium" | "low";
  assetId?: Types.ObjectId;
  assetName?: string;
  location: string;
  assignedTo?: string;
  assignedTeam?: string;
  requestedBy: string;
  dueDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours?: number;
  cost?: number;
  notes: string;
  attachments: string[];
  auditLog: IAuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const AuditEntrySchema = new Schema<IAuditEntry>(
  { action: String, performedBy: String, timestamp: { type: Date, default: Date.now }, notes: String },
  { _id: false }
);

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    woNumber:       { type: String, required: true, unique: true, uppercase: true, trim: true },
    title:          { type: String, required: true, trim: true, maxlength: 300 },
    description:    { type: String, trim: true, default: "" },
    type:           { type: String, required: true, enum: ["corrective","preventive","inspection","emergency"], default: "corrective" },
    status:         { type: String, required: true, enum: ["open","assigned","in_progress","on_hold","completed","cancelled"], default: "open" },
    priority:       { type: String, required: true, enum: ["critical","high","medium","low"], default: "medium" },
    assetId:        { type: Schema.Types.ObjectId, ref: "Asset" },
    assetName:      { type: String, trim: true },
    location:       { type: String, trim: true, default: "" },
    assignedTo:     { type: String, trim: true },
    assignedTeam:   { type: String, trim: true },
    requestedBy:    { type: String, required: true, trim: true },
    dueDate:        { type: Date, required: true },
    startedAt:      { type: Date },
    completedAt:    { type: Date },
    estimatedHours: { type: Number, min: 0, default: 1 },
    actualHours:    { type: Number, min: 0 },
    cost:           { type: Number, min: 0 },
    notes:          { type: String, trim: true, default: "" },
    attachments:    [{ type: String }],
    auditLog:       [AuditEntrySchema],
  },
  { timestamps: true }
);

WorkOrderSchema.index({ status: 1, priority: 1 });
WorkOrderSchema.index({ title: "text", woNumber: "text" });

export const WorkOrder = model<IWorkOrder>("WorkOrder", WorkOrderSchema);
