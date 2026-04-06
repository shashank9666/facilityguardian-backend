import { Schema, model, Document } from "mongoose";

interface ITimelineEntry {
  action: string;
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

export interface IIncident extends Document {
  incidentNumber: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "investigating" | "resolved" | "closed";
  location: string;
  reportedBy: string;
  reportedAt: Date;
  assignedTo?: string;
  resolvedAt?: Date;
  category: string;
  timeline: ITimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const TimelineSchema = new Schema<ITimelineEntry>(
  { action: String, performedBy: String, timestamp: { type: Date, default: Date.now }, notes: String },
  { _id: false }
);

const IncidentSchema = new Schema<IIncident>(
  {
    incidentNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title:          { type: String, required: true, trim: true, maxlength: 300 },
    description:    { type: String, trim: true, default: "" },
    severity:       { type: String, required: true, enum: ["low","medium","high","critical"], default: "medium" },
    status:         { type: String, required: true, enum: ["reported","investigating","resolved","closed"], default: "reported" },
    location:       { type: String, trim: true, default: "" },
    reportedBy:     { type: String, required: true, trim: true },
    reportedAt:     { type: Date, default: Date.now },
    assignedTo:     { type: String, trim: true },
    resolvedAt:     { type: Date },
    category:       { type: String, trim: true, default: "Other" },
    timeline:       [TimelineSchema],
  },
  { timestamps: true }
);

IncidentSchema.index({ status: 1, severity: 1 });

export const Incident = model<IIncident>("Incident", IncidentSchema);
